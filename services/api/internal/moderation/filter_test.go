package moderation

import (
	"testing"
)

func TestFilter_BlocksProfanityAndHate(t *testing.T) {
	f := DefaultFilter()
	cases := []string{
		"what the fuck",
		"You are a nigger",
		"heil hitler forever",
		"that faggot lost",
		"kill yourself already",
		"f.u.c.k this",
		"sh1t take",
		"white power forever",
		"you retard",
		"gas the jews",
	}
	for _, c := range cases {
		if err := f.Check(c); err == nil {
			t.Fatalf("expected block for %q", c)
		}
	}
}

func TestFilter_AllowsCleanFootballTalk(t *testing.T) {
	f := DefaultFilter()
	cases := []string{
		"Great strike from the left wing",
		"Messi vs Ronaldo forever",
		"Come on you reds!",
		"Referee was awful today",
	}
	for _, c := range cases {
		if err := f.Check(c); err != nil {
			t.Fatalf("unexpected block for %q: %v", c, err)
		}
	}
}

func TestNormalizeLeetspeak(t *testing.T) {
	if got := normalize("F*u*c*k"); got != "fuck" {
		t.Fatalf("normalize leetspeak got %q want fuck", got)
	}
	if got := normalize("sh1t take"); got != "shit take" {
		t.Fatalf("normalize leet digit got %q", got)
	}
}
