package moderation

import (
	"fmt"
	"log"
	"net"
	"net/smtp"
	"strings"
	"time"
)

// MailConfig configures optional SMTP delivery for moderation alerts.
type MailConfig struct {
	Host     string
	Port     string
	Username string
	Password string
	From     string
	To       string // default contact@magistri.dev
}

// Notifier sends report/block alerts to the moderation inbox.
type Notifier struct {
	Mail MailConfig
}

// ReportEmailPayload is the content of a moderation alert.
type ReportEmailPayload struct {
	ReportID       string
	ReporterID     int32
	ReportedUserID *int32
	ReportableType string
	ReportableID   string
	Reason         string
	Description    string
	Source         string // "report" | "block"
}

// sanitizeHeaderValue strips CR/LF (and other ASCII controls) so untrusted
// payload fields cannot inject SMTP/RFC 5322 headers (CWE-93).
func sanitizeHeaderValue(s string) string {
	if s == "" {
		return s
	}
	var b strings.Builder
	b.Grow(len(s))
	for _, r := range s {
		if r == '\r' || r == '\n' || r == '\x00' {
			continue
		}
		// Drop other C0 controls that can confuse mail agents.
		if r < 0x20 && r != '\t' {
			continue
		}
		b.WriteRune(r)
	}
	return strings.TrimSpace(b.String())
}

// NotifyReport emails the moderation inbox, or logs loudly when SMTP is unset.
func (n *Notifier) NotifyReport(p ReportEmailPayload) {
	to := sanitizeHeaderValue(n.Mail.To)
	if to == "" {
		to = "contact@magistri.dev"
	}
	source := sanitizeHeaderValue(p.Source)
	reportableType := sanitizeHeaderValue(p.ReportableType)
	reason := sanitizeHeaderValue(p.Reason)
	subject := sanitizeHeaderValue(fmt.Sprintf("[Fucci Moderation] %s — %s (%s)", source, reportableType, reason))
	body := formatReportBody(p)

	if strings.TrimSpace(n.Mail.Host) == "" {
		log.Printf("MODERATION_ALERT (SMTP unset) to=%s subject=%q\n%s", to, subject, body)
		return
	}

	from := sanitizeHeaderValue(n.Mail.From)
	if from == "" {
		from = to
	}
	port := strings.TrimSpace(n.Mail.Port)
	if port == "" {
		port = "587"
	}
	addr := net.JoinHostPort(n.Mail.Host, port)
	msg := []byte("From: " + from + "\r\n" +
		"To: " + to + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"MIME-Version: 1.0\r\n" +
		"Content-Type: text/plain; charset=UTF-8\r\n" +
		"\r\n" + body + "\r\n")

	var auth smtp.Auth
	if strings.TrimSpace(n.Mail.Username) != "" {
		auth = smtp.PlainAuth("", n.Mail.Username, n.Mail.Password, n.Mail.Host)
	}
	if err := smtp.SendMail(addr, auth, from, []string{to}, msg); err != nil {
		log.Printf("MODERATION_ALERT email failed: %v — falling back to log\n%s", err, body)
	}
}

func formatReportBody(p ReportEmailPayload) string {
	reported := "n/a"
	if p.ReportedUserID != nil {
		reported = fmt.Sprintf("%d", *p.ReportedUserID)
	}
	desc := strings.TrimSpace(p.Description)
	if desc == "" {
		desc = "(none)"
	}
	// Flatten CR/LF in description so logged/rewrapped bodies cannot reintroduce header splits.
	desc = strings.ReplaceAll(strings.ReplaceAll(desc, "\r", " "), "\n", " ")
	return strings.Join([]string{
		"A content report requires review within 24 hours.",
		"",
		"Source: " + sanitizeHeaderValue(p.Source),
		"Report ID: " + sanitizeHeaderValue(p.ReportID),
		"Reporter user ID: " + fmt.Sprintf("%d", p.ReporterID),
		"Reported user ID: " + reported,
		"Type: " + sanitizeHeaderValue(p.ReportableType),
		"Content ID: " + sanitizeHeaderValue(p.ReportableID),
		"Reason: " + sanitizeHeaderValue(p.Reason),
		"Description: " + desc,
		"Received at (UTC): " + time.Now().UTC().Format(time.RFC3339),
		"",
		"Action: remove the content and soft-deactivate the offending user if the report is valid.",
		"See services/api/scripts/moderation.sql for helper queries.",
	}, "\n")
}
