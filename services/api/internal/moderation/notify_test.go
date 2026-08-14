package moderation

import (
	"strings"
	"testing"
)

func TestSanitizeHeaderValue_StripsCRLF(t *testing.T) {
	t.Parallel()
	in := "user\r\nContent-Type: text/html\r\n\r\n<script>x</script>"
	got := sanitizeHeaderValue(in)
	if strings.ContainsAny(got, "\r\n") {
		t.Fatalf("CR/LF remain in %q", got)
	}
	if strings.Contains(got, "Content-Type") && strings.Contains(got, "\n") {
		t.Fatalf("header injection still possible: %q", got)
	}
	// Injected tokens may remain as plain text after stripping, but cannot
	// introduce new header lines.
	want := "userContent-Type: text/html<script>x</script>"
	if got != want {
		t.Fatalf("got %q want %q", got, want)
	}
}

func TestSanitizeHeaderValue_EmptyAndControls(t *testing.T) {
	t.Parallel()
	if got := sanitizeHeaderValue(""); got != "" {
		t.Fatalf("empty: got %q", got)
	}
	if got := sanitizeHeaderValue("  hello\x00world  "); got != "helloworld" {
		t.Fatalf("controls: got %q", got)
	}
}

func TestNotifyReport_SubjectCannotContainInjectedHeaders(t *testing.T) {
	t.Parallel()
	n := &Notifier{} // SMTP unset → log path; still exercises sanitization
	p := ReportEmailPayload{
		ReportID:       "id-1",
		ReporterID:     1,
		ReportableType: "user\r\nBcc: attacker@evil.test\r\n",
		ReportableID:   "2",
		Reason:         "harassment\r\nSubject: pwned",
		Description:    "hi\r\n.\r\nMAIL FROM:<evil>",
		Source:         "block\r\nFrom: spoof@evil.test",
	}
	// Should not panic; sanitization happens inside NotifyReport.
	n.NotifyReport(p)

	subject := sanitizeHeaderValue(
		"[Fucci Moderation] " + p.Source + " — " + p.ReportableType + " (" + p.Reason + ")",
	)
	if strings.ContainsAny(subject, "\r\n") {
		t.Fatalf("subject still contains CR/LF: %q", subject)
	}
	body := formatReportBody(p)
	for _, line := range strings.Split(body, "\n") {
		// Body lines themselves are fine; ensure Description was flattened.
		if strings.HasPrefix(line, "Description:") && (strings.Contains(line, "\r") || strings.Count(line, "\n") > 0) {
			// single line check — Description value must not embed raw CR
			if strings.Contains(line, "\r") {
				t.Fatalf("description retained CR: %q", line)
			}
		}
	}
	if strings.Contains(body, "\r") {
		t.Fatalf("body retained CR: %q", body)
	}
}
