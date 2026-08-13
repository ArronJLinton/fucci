package api

import (
	"context"
	"database/sql"
	"errors"
	"log"
	"net/http"
	"sync"

	"github.com/ArronJLinton/fucci-api/internal/auth"
	"github.com/ArronJLinton/fucci-api/internal/moderation"
)

const accountDeactivatedMessage = "This account has been deactivated. Contact support if you believe this is a mistake."

var (
	contentFilterOnce sync.Once
	contentFilter     *moderation.Filter
)

func (c *Config) objectionableFilter() *moderation.Filter {
	contentFilterOnce.Do(func() {
		contentFilter = moderation.DefaultFilter()
	})
	return contentFilter
}

func (c *Config) rejectIfObjectionable(w http.ResponseWriter, text string) bool {
	if err := c.objectionableFilter().Check(text); err != nil {
		respondWithErrorCode(w, http.StatusBadRequest, err.Error(), "OBJECTIONABLE_CONTENT")
		return true
	}
	return false
}

func (c *Config) moderationNotifier() *moderation.Notifier {
	if c.ModerationNotifier != nil {
		return c.ModerationNotifier
	}
	to := c.ModerationNotifyEmail
	if to == "" {
		to = "contact@magistri.dev"
	}
	return &moderation.Notifier{
		Mail: moderation.MailConfig{
			Host:     c.SMTPHost,
			Port:     c.SMTPPort,
			Username: c.SMTPUsername,
			Password: c.SMTPPassword,
			From:     c.SMTPFrom,
			To:       to,
		},
	}
}

func (c *Config) recordTermsAcceptance(ctx context.Context, userID int32) {
	if userID == 0 || c.DBConn == nil {
		// Production always sets DBConn. Unit tests often wire only sqlc DB mocks.
		return
	}
	_, err := c.DBConn.ExecContext(ctx,
		`UPDATE users SET terms_accepted_at = CURRENT_TIMESTAMP, terms_version = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
		moderation.CurrentTermsVersion, userID,
	)
	if err != nil {
		log.Printf("record terms acceptance user=%d: %v", userID, err)
	}
}

func requireAcceptedTerms(accepted bool) error {
	if !accepted {
		return errors.New("you must accept the Terms of Use to continue")
	}
	return nil
}

func (c *Config) blockedUserIDSet(ctx context.Context, blockerID int32) map[int32]struct{} {
	out := map[int32]struct{}{}
	if c.DB == nil || blockerID == 0 {
		return out
	}
	ids, err := c.DB.ListBlockedUserIDs(ctx, blockerID)
	if err != nil {
		return out
	}
	for _, id := range ids {
		out[id] = struct{}{}
	}
	return out
}

func filterStoriesByBlocked(stories []userStoryPayload, blocked map[int32]struct{}) []userStoryPayload {
	if len(blocked) == 0 || len(stories) == 0 {
		return stories
	}
	out := make([]userStoryPayload, 0, len(stories))
	for _, s := range stories {
		if _, ok := blocked[s.UserID]; ok {
			continue
		}
		out = append(out, s)
	}
	return out
}

func (c *Config) ensureUserActive(ctx context.Context, userID int32) error {
	if c.DB == nil || userID == 0 {
		return nil
	}
	active, err := c.DB.IsUserActive(ctx, userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return errors.New("user not found")
		}
		return err
	}
	if !active {
		return errAccountDeactivated
	}
	return nil
}

var errAccountDeactivated = errors.New(accountDeactivatedMessage)

func respondAccountDeactivated(w http.ResponseWriter) {
	respondWithErrorCode(w, http.StatusForbidden, accountDeactivatedMessage, auth.GoogleAuthAccountInactive)
}

func (c *Config) requireActiveAuthedUser(w http.ResponseWriter, r *http.Request) (int32, bool) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok || userID == 0 {
		respondWithError(w, http.StatusUnauthorized, "Authentication required")
		return 0, false
	}
	if err := c.ensureUserActive(r.Context(), userID); err != nil {
		if errors.Is(err, errAccountDeactivated) {
			respondAccountDeactivated(w)
			return 0, false
		}
		respondWithError(w, http.StatusInternalServerError, "failed to verify account status")
		return 0, false
	}
	return userID, true
}
