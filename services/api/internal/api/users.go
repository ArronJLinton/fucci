package api

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/ArronJLinton/fucci-api/internal/auth"
	"github.com/lib/pq"
)

type CreateUserRequest struct {
	Firstname     string `json:"firstname"`
	Lastname      string `json:"lastname"`
	Email         string `json:"email"`
	Password      string `json:"password"`
	DisplayName   string `json:"display_name,omitempty"`
	AvatarURL     string `json:"avatar_url,omitempty"`
	AcceptedTerms bool   `json:"accepted_terms"`
}

type CreateUserResponse struct {
	User  UserResponse `json:"user"`
	Token string       `json:"token"`
}

func (config *Config) handleCreateUser(w http.ResponseWriter, r *http.Request) {
	var req CreateUserRequest
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&req)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, fmt.Sprintf("Error parsing JSON: %s", err))
		return
	}

	if err := requireAcceptedTerms(req.AcceptedTerms); err != nil {
		respondWithErrorCode(w, http.StatusBadRequest, err.Error(), "TERMS_REQUIRED")
		return
	}

	email := normalizeAuthEmail(req.Email)
	if email == "" {
		respondWithError(w, http.StatusBadRequest, "email is required")
		return
	}

	// Soft-deactivated accounts keep their email; surface a clear message instead of "already in use".
	// Match case-insensitively: mixed-case register + lowercase OAuth/re-register must not mint a new active row.
	if config.DBConn != nil {
		var existingID int32
		var existingActive bool
		qerr := config.DBConn.QueryRowContext(r.Context(),
			`SELECT id, COALESCE(is_active, true) FROM users WHERE LOWER(email) = $1 LIMIT 1`,
			email,
		).Scan(&existingID, &existingActive)
		if qerr == nil {
			if !existingActive {
				respondAccountDeactivated(w)
				return
			}
			respondWithError(w, http.StatusConflict, "Email already in use")
			return
		}
		if qerr != sql.ErrNoRows {
			log.Printf("create user: email lookup: %v", qerr)
			respondWithError(w, http.StatusInternalServerError, "Could not create account")
			return
		}
	}

	if config.rejectIfObjectionable(w, req.Firstname) ||
		config.rejectIfObjectionable(w, req.Lastname) ||
		config.rejectIfObjectionable(w, req.DisplayName) {
		return
	}

	// Validate password
	if err := auth.ValidatePasswordStrength(req.Password); err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	// Hash password
	passwordHash, err := auth.HashPassword(req.Password)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to process password")
		return
	}

	// Set display name to firstname + lastname if not provided
	displayName := req.DisplayName
	if displayName == "" {
		displayName = fmt.Sprintf("%s %s", req.Firstname, req.Lastname)
	}

	// Insert user with password hash and optional avatar_url; RETURNING all fields needed for response
	query := `INSERT INTO users (firstname, lastname, email, password_hash, display_name, role, avatar_url)
			  VALUES ($1, $2, $3, $4, $5, 'fan', NULLIF($6, ''))
			  RETURNING id, firstname, lastname, email, created_at, updated_at, role,
			  COALESCE(display_name, ''), COALESCE(avatar_url, ''), is_verified, is_active`

	var id int32
	var firstname, lastname, emailOut, role, displayNameOut, avatarURL string
	var createdAt, updatedAt time.Time
	var isVerified, isActive bool
	err = config.DBConn.QueryRow(query, req.Firstname, req.Lastname, email, passwordHash, displayName, req.AvatarURL).Scan(
		&id, &firstname, &lastname, &emailOut, &createdAt, &updatedAt, &role,
		&displayNameOut, &avatarURL, &isVerified, &isActive,
	)
	if err != nil {
		var pqErr *pq.Error
		if errors.As(err, &pqErr) && pqErr.Code == "23505" {
			respondWithError(w, http.StatusConflict, "Email already in use")
			return
		}
		log.Printf("create user: db error: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Could not create account")
		return
	}

	token, err := auth.GenerateToken(id, emailOut, role, 24*time.Hour)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to generate token")
		return
	}

	userResponse := UserResponse{
		ID:          id,
		Firstname:   firstname,
		Lastname:    lastname,
		Email:       emailOut,
		DisplayName: displayNameOut,
		AvatarURL:   avatarURL,
		IsVerified:  isVerified,
		IsActive:    isActive,
		Role:        role,
		CreatedAt:   createdAt.Format(time.RFC3339),
		UpdatedAt:   updatedAt.Format(time.RFC3339),
	}

	config.recordTermsAcceptance(r.Context(), id)
	respondWithJSON(w, http.StatusCreated, CreateUserResponse{User: userResponse, Token: token})
}

func (config *Config) handleListAllUsers(w http.ResponseWriter, r *http.Request) {
	users, err := config.DB.ListUsers(r.Context())
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Error listing users: %s", err))
		return
	}
	out := make([]UserResponse, 0, len(users))
	for _, u := range users {
		out = append(out, userResponseFromDBUser(u))
	}
	respondWithJSON(w, http.StatusOK, out)
}
