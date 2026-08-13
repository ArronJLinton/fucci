package api

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/ArronJLinton/fucci-api/internal/database"
	"github.com/ArronJLinton/fucci-api/internal/moderation"
	"github.com/go-chi/chi"
	"github.com/lib/pq"
)

type createUserBlockRequest struct {
	BlockedUserID  int32   `json:"blocked_user_id"`
	ReportableType string  `json:"reportable_type,omitempty"`
	ReportableID   string  `json:"reportable_id,omitempty"`
	Reason         string  `json:"reason,omitempty"`
	Description    *string `json:"description,omitempty"`
}

// POST /v1/api/users/blocks — block a user, auto-create a content report, email moderation.
func (c *Config) postUserBlock(w http.ResponseWriter, r *http.Request) {
	blockerID, ok := c.requireActiveAuthedUser(w, r)
	if !ok {
		return
	}
	if c.DB == nil {
		respondWithError(w, http.StatusInternalServerError, "Database not configured")
		return
	}

	var req createUserBlockRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if req.BlockedUserID <= 0 {
		respondWithError(w, http.StatusBadRequest, "blocked_user_id is required")
		return
	}
	if req.BlockedUserID == blockerID {
		respondWithError(w, http.StatusBadRequest, "cannot block yourself")
		return
	}

	_, err := c.DB.GetUser(r.Context(), req.BlockedUserID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			respondWithError(w, http.StatusNotFound, "user not found")
			return
		}
		respondWithError(w, http.StatusInternalServerError, "Failed to load user")
		return
	}

	block, err := c.DB.CreateUserBlock(r.Context(), database.CreateUserBlockParams{
		BlockerID:     blockerID,
		BlockedUserID: req.BlockedUserID,
	})
	if err != nil {
		var pqErr *pq.Error
		if errors.As(err, &pqErr) && pqErr.Code == "23505" {
			// Already blocked — still ensure a report/notify path is not duplicated noisily.
			respondWithJSON(w, http.StatusOK, map[string]interface{}{
				"status":          "already_blocked",
				"blocked_user_id": req.BlockedUserID,
			})
			return
		}
		respondWithError(w, http.StatusInternalServerError, "Failed to block user")
		return
	}

	reason := strings.TrimSpace(req.Reason)
	if reason == "" {
		reason = "harassment"
	}
	if _, ok := allowedReportReasons[reason]; !ok {
		respondWithError(w, http.StatusBadRequest, "invalid reason")
		return
	}

	reportableType := strings.TrimSpace(req.ReportableType)
	if reportableType == "" {
		reportableType = "user"
	}
	reportableID := strings.TrimSpace(req.ReportableID)
	if reportableID == "" {
		reportableID = strconv.FormatInt(int64(req.BlockedUserID), 10)
	}

	var description sql.NullString
	if req.Description != nil {
		d := strings.TrimSpace(*req.Description)
		if d != "" {
			description = sql.NullString{String: d, Valid: true}
		}
	}
	if !description.Valid {
		description = sql.NullString{
			String: "Auto-created when user was blocked",
			Valid:  true,
		}
	}

	report, err := c.DB.CreateContentReport(r.Context(), database.CreateContentReportParams{
		ReporterID:     blockerID,
		ReportableType: reportableType,
		ReportableID:   reportableID,
		ReportedUserID: sql.NullInt32{Int32: req.BlockedUserID, Valid: true},
		Reason:         reason,
		Description:    description,
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to create report for block")
		return
	}

	reportedID := req.BlockedUserID
	go c.moderationNotifier().NotifyReport(moderation.ReportEmailPayload{
		ReportID:       report.ID.String(),
		ReporterID:     blockerID,
		ReportedUserID: &reportedID,
		ReportableType: reportableType,
		ReportableID:   reportableID,
		Reason:         reason,
		Description:    description.String,
		Source:         "block",
	})

	respondWithJSON(w, http.StatusCreated, map[string]interface{}{
		"id":              block.ID.String(),
		"blocked_user_id": req.BlockedUserID,
		"report_id":       report.ID.String(),
		"created_at":      block.CreatedAt.UTC().Format("2006-01-02T15:04:05Z07:00"),
	})
}

// DELETE /v1/api/users/blocks/{blockedUserId}
func (c *Config) deleteUserBlock(w http.ResponseWriter, r *http.Request) {
	blockerID, ok := c.requireActiveAuthedUser(w, r)
	if !ok {
		return
	}
	if c.DB == nil {
		respondWithError(w, http.StatusInternalServerError, "Database not configured")
		return
	}

	raw := strings.TrimSpace(chi.URLParam(r, "blockedUserId"))
	blockedID, err := strconv.ParseInt(raw, 10, 32)
	if err != nil || blockedID <= 0 {
		respondWithError(w, http.StatusBadRequest, "invalid blockedUserId")
		return
	}

	if err := c.DB.DeleteUserBlock(r.Context(), database.DeleteUserBlockParams{
		BlockerID:     blockerID,
		BlockedUserID: int32(blockedID),
	}); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to unblock user")
		return
	}
	respondWithJSON(w, http.StatusOK, map[string]string{"status": "unblocked"})
}

// GET /v1/api/users/blocks — list blocked user ids for the current user.
func (c *Config) listUserBlocks(w http.ResponseWriter, r *http.Request) {
	blockerID, ok := c.requireActiveAuthedUser(w, r)
	if !ok {
		return
	}
	ids, err := c.DB.ListBlockedUserIDs(r.Context(), blockerID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to list blocks")
		return
	}
	if ids == nil {
		ids = []int32{}
	}
	respondWithJSON(w, http.StatusOK, map[string]interface{}{"blocked_user_ids": ids})
}
