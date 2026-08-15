// Package moderation provides App Store Guideline 1.2 helpers: keyword filtering
// and outbound report notifications.
package moderation

import (
	"fmt"
	"regexp"
	"strings"
	"unicode"
)

// CurrentTermsVersion is stored when a user accepts the EULA. Bump when Terms change materially.
const CurrentTermsVersion = "2026-08-13"

// ErrObjectionable is returned when submitted text matches the blocklist.
var ErrObjectionable = fmt.Errorf("content contains language that violates our community guidelines")

// defaultBlocklist covers profanity and hate/discriminatory language (race, religion,
// ethnicity, age, disability, gender, sexual orientation, and related slurs).
// Matching is case-insensitive with basic leetspeak normalization.
var defaultBlocklist = []string{
	// Profanity / sexual
	"asshole", "assholes", "bastard", "bastards", "bitch", "bitches", "bollocks",
	"bullshit", "cock", "cocks", "cunt", "cunts", "dick", "dicks", "dickhead",
	"fuck", "fucker", "fuckers", "fucking", "motherfucker", "motherfuckers",
	"piss", "pissed", "prick", "pricks", "pussy", "shit", "shitty", "slut",
	"sluts", "whore", "whores", "wanker", "wankers",

	// Racial / ethnic hate
	"chink", "chinks", "coon", "coons", "gook", "gooks", "kike", "kikes",
	"nigger", "niggers", "nigga", "niggas", "spic", "spics", "wetback", "wetbacks",
	"paki", "pakis", "beaner", "beaners", "cracker", "crackers", "honky", "honkies",
	"raghead", "ragheads", "towelhead", "towelheads", "sandnigger", "sandniggers",

	// Antisemitic / Islamophobic / religious hate
	"christkiller", "jewboy", "muzzie", "muzzies", "infidel", "infidels",
	"heathen scum", "kill jews", "kill muslims", "kill christians", "gas the",
	"heil hitler", "sieg heil",

	// Homophobic / transphobic
	"fag", "fags", "faggot", "faggots", "dyke", "dykes", "tranny", "trannies",
	"shemale", "shemales", "homo", "homos",

	// Ableist / disability hate
	"retard", "retards", "retarded", "spastic", "spaz", "cripple", "cripples",
	"mongoloid", "mongoloids",

	// Ageist / gendered hate phrases often used abusively
	"kill yourself", "kys", "rape you", "rapist", "go die", "die bitch",
	"old hag", "old fart", "boomer trash",

	// Broader hate / supremacy cues
	"white power", "white pride worldwide", "race war", "ethnic cleansing",
	"holocaust denial", "lynch them", "hang them",
}

var multiSpace = regexp.MustCompile(`\s+`)

// Filter holds the normalized keyword set used for objectionable-content checks.
type Filter struct {
	phrases []string
}

// DefaultFilter returns the seeded keyword filter.
func DefaultFilter() *Filter {
	f := &Filter{}
	for _, raw := range defaultBlocklist {
		n := normalize(raw)
		if n != "" {
			f.phrases = append(f.phrases, n)
		}
	}
	return f
}

// Check returns ErrObjectionable when text contains a blocked phrase.
func (f *Filter) Check(text string) error {
	if f == nil || strings.TrimSpace(text) == "" {
		return nil
	}
	norm := normalize(text)
	if norm == "" {
		return nil
	}
	padded := " " + norm + " "
	for _, phrase := range f.phrases {
		if strings.Contains(padded, " "+phrase+" ") {
			return ErrObjectionable
		}
	}
	return nil
}

func normalize(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	if s == "" {
		return ""
	}
	var b strings.Builder
	b.Grow(len(s))
	for _, r := range s {
		switch {
		case r == '@':
			b.WriteByte('a')
		case r == '0':
			b.WriteByte('o')
		case r == '1':
			b.WriteByte('i')
		case r == '3':
			b.WriteByte('e')
		case r == '4':
			b.WriteByte('a')
		case r == '5':
			b.WriteByte('s')
		case r == '7':
			b.WriteByte('t')
		case r == '$':
			b.WriteByte('s')
		case unicode.IsSpace(r):
			b.WriteByte(' ')
		case unicode.IsLetter(r) || unicode.IsDigit(r):
			b.WriteRune(r)
		default:
			// Drop punctuation so "f.u.c.k" / "f*u*c*k" collapse to "fuck".
		}
	}
	out := multiSpace.ReplaceAllString(b.String(), " ")
	return strings.TrimSpace(out)
}
