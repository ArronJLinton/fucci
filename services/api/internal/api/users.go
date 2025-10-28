package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/ArronJLinton/fucci-api/internal/auth"
)

type CreateUserRequest struct {
	Firstname   string `json:"firstname"`
	Lastname    string `json:"lastname"`
	Email       string `json:"email"`
	Password    string `json:"password"`
	DisplayName string `json:"display_name,omitempty"`
}

func (config *Config) handleCreateUser(w http.ResponseWriter, r *http.Request) {
	var req CreateUserRequest
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&req)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, fmt.Sprintf("Error parsing JSON: %s", err))
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

	// Insert user with password hash
	query := `INSERT INTO users (firstname, lastname, email, password_hash, display_name, role) 
			  VALUES ($1, $2, $3, $4, $5, 'fan') 
			  RETURNING id, firstname, lastname, email, created_at, updated_at, is_admin`

	var user struct {
		ID        int32  `json:"id"`
		Firstname string `json:"firstname"`
		Lastname  string `json:"lastname"`
		Email     string `json:"email"`
		CreatedAt string `json:"created_at"`
		UpdatedAt string `json:"updated_at"`
		IsAdmin   bool   `json:"is_admin"`
	}

	err = config.DBConn.QueryRow(query, req.Firstname, req.Lastname, req.Email, passwordHash, displayName).Scan(
		&user.ID, &user.Firstname, &user.Lastname, &user.Email, &user.CreatedAt, &user.UpdatedAt, &user.IsAdmin,
	)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, fmt.Sprintf("Error creating user: %s", err))
		return
	}
	respondWithJSON(w, http.StatusCreated, user)
}

func (config *Config) handleListAllUsers(w http.ResponseWriter, r *http.Request) {
	users, err := config.DB.ListUsers(r.Context())
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Error listing users: %s", err))
		return
	}
	respondWithJSON(w, http.StatusOK, users)
}
