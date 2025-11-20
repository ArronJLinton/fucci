package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/ArronJLinton/fucci-api/internal/api"
	"github.com/ArronJLinton/fucci-api/internal/cache"
	"github.com/ArronJLinton/fucci-api/internal/config"
	"github.com/ArronJLinton/fucci-api/internal/database"
	"github.com/go-chi/chi"
	"github.com/go-chi/cors"
	_ "github.com/lib/pq"
	"github.com/uptrace/opentelemetry-go-extra/otelzap"
	"go.uber.org/zap"
)

type Config struct {
	DB *database.Queries
}

var (
	version = "dev"
)

func main() {
	// Initialize the logger
	zlog, _ := zap.NewProduction(
		zap.Fields(
			zap.String("version", version),
		),
	)
	defer func() {
		_ = zlog.Sync()
	}()
	logger := otelzap.New(zlog)

	// Initialize the configuration
	c := config.InitConfig(logger)

	// Initialize JWT authentication
	if err := api.InitJWT(c.JWT_SECRET); err != nil {
		log.Printf("Warning: Failed to initialize JWT auth: %v (auth features may not work)\n", err)
	}

	conn, err := sql.Open("postgres", c.DB_URL)
	if err != nil {
		log.Fatal("Failed to connect to Database - ", err)
	}

	// Initialize Redis cache
	redisCache, err := cache.NewCache(c.REDIS_URL)
	if err != nil {
		log.Fatal("Failed to connect to Redis - ", err)
	}

	router := chi.NewRouter()
	// Tells browsers how this api can be used
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", ";http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"string"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	v1Router := chi.NewRouter()
	dbQueries := database.New(conn)
	apiCfg := api.Config{
		DB:             dbQueries,
		DBConn:         conn,
		FootballAPIKey: c.FOOTBALL_API_KEY,
		RapidAPIKey:    c.RAPID_API_KEY,
		Cache:          redisCache,
		OpenAIKey:      c.OPENAI_API_KEY,
		OpenAIBaseURL:  c.OPENAI_BASE_URL,
	}
	apiRouter := api.New(apiCfg)
	v1Router.Mount("/api", apiRouter)
	router.Mount("/v1", v1Router)

	// Serve static pages (Privacy Policy, etc.)
	router.Get("/privacy-policy", servePrivacyPolicy)
	router.Get("/privacy", servePrivacyPolicy) // Alias for convenience

	// Data deletion request page
	router.Get("/data-deletion-request", serveDataDeletionRequest)
	router.Post("/data-deletion-request", handleDataDeletionRequest)

	// Get port from environment variable with fallback
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Always bind to 0.0.0.0 for both local and production
	bindAddr := "0.0.0.0"
	serverAddr := fmt.Sprintf("%s:%s", bindAddr, port)
	fmt.Printf("Server starting on %s\n", serverAddr)

	server := &http.Server{
		Handler: router,
		Addr:    serverAddr,
	}

	err = server.ListenAndServe()
	if err != nil {
		log.Fatal(err)
	}
}

// servePrivacyPolicy serves the privacy policy HTML page
func servePrivacyPolicy(w http.ResponseWriter, r *http.Request) {
	// Try to find the privacy policy HTML file
	// Check multiple possible locations
	possiblePaths := []string{
		"./static/privacy-policy.html",
		"./privacy-policy.html",
		"static/privacy-policy.html",
		filepath.Join(filepath.Dir(os.Args[0]), "static/privacy-policy.html"),
	}

	var htmlContent []byte
	var err error
	var foundPath string

	for _, path := range possiblePaths {
		htmlContent, err = os.ReadFile(path)
		if err == nil {
			foundPath = path
			break
		}
	}

	// If file not found, serve embedded HTML
	if err != nil {
		log.Printf("Privacy policy file not found, serving embedded version")
		htmlContent = []byte(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Privacy Policy - Fucci</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1 {
            color: #000;
            border-bottom: 2px solid #007AFF;
            padding-bottom: 10px;
        }
        h2 {
            color: #333;
            margin-top: 30px;
        }
        .last-updated {
            color: #666;
            font-style: italic;
        }
    </style>
</head>
<body>
    <h1>Privacy Policy</h1>
    <p class="last-updated">Last Updated: January 27, 2025</p>
    
    <h2>1. Introduction</h2>
    <p>Welcome to Fucci. This Privacy Policy explains how we collect, use, and protect your information.</p>
    
    <h2>2. Information We Collect</h2>
    <p>We collect information you provide directly, usage data, and device information to provide and improve our services.</p>
    
    <h2>3. How We Use Your Information</h2>
    <p>We use your information to provide, maintain, and improve our services, process requests, and communicate with you.</p>
    
    <h2>4. Data Security</h2>
    <p>We implement appropriate security measures to protect your personal information.</p>
    
    <h2>5. Contact Us</h2>
    <p>If you have questions about this Privacy Policy, please contact us at privacy@fucci.app</p>
</body>
</html>`)
	} else {
		log.Printf("Serving privacy policy from: %s", foundPath)
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	w.Write(htmlContent)
}

// serveDataDeletionRequest serves the data deletion request HTML page
func serveDataDeletionRequest(w http.ResponseWriter, r *http.Request) {
	possiblePaths := []string{
		"./static/data-deletion-request.html",
		"./data-deletion-request.html",
		"static/data-deletion-request.html",
		filepath.Join(filepath.Dir(os.Args[0]), "static/data-deletion-request.html"),
	}

	var htmlContent []byte
	var err error
	var foundPath string

	for _, path := range possiblePaths {
		htmlContent, err = os.ReadFile(path)
		if err == nil {
			foundPath = path
			break
		}
	}

	// If file not found, serve embedded HTML
	if err != nil {
		log.Printf("Data deletion request file not found, serving embedded version")
		htmlContent = []byte(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data Deletion Request - Fucci</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1 {
            color: #000;
            border-bottom: 2px solid #007AFF;
            padding-bottom: 10px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
        }
        input, textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            box-sizing: border-box;
        }
        textarea {
            min-height: 120px;
        }
        button {
            background-color: #007AFF;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            width: 100%;
        }
    </style>
</head>
<body>
    <h1>Data Deletion Request</h1>
    <p>Please fill out the form below to request deletion of your account and associated data.</p>
    <form id="deletionForm">
        <div class="form-group">
            <label for="email">Email Address *</label>
            <input type="email" id="email" name="email" required>
        </div>
        <div class="form-group">
            <label for="username">Username (Optional)</label>
            <input type="text" id="username" name="username">
        </div>
        <div class="form-group">
            <label for="reason">Reason for Deletion *</label>
            <textarea id="reason" name="reason" required></textarea>
        </div>
        <button type="submit">Submit Deletion Request</button>
    </form>
    <script>
        document.getElementById('deletionForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                email: document.getElementById('email').value,
                username: document.getElementById('username').value || null,
                reason: document.getElementById('reason').value
            };
            try {
                const response = await fetch('/data-deletion-request', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(formData)
                });
                if (response.ok) {
                    alert('Thank you! Your request has been received.');
                    e.target.reset();
                }
            } catch (error) {
                alert('Error submitting request. Please try again.');
            }
        });
    </script>
</body>
</html>`)
	} else {
		log.Printf("Serving data deletion request page from: %s", foundPath)
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	w.Write(htmlContent)
}

// DataDeletionRequest represents a data deletion request
type DataDeletionRequest struct {
	Email    string  `json:"email"`
	Username *string `json:"username,omitempty"`
	Reason   string  `json:"reason"`
}

// handleDataDeletionRequest handles the POST request for data deletion requests
func handleDataDeletionRequest(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req DataDeletionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Error decoding data deletion request: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.Email == "" {
		http.Error(w, "Email is required", http.StatusBadRequest)
		return
	}
	if req.Reason == "" {
		http.Error(w, "Reason is required", http.StatusBadRequest)
		return
	}

	// Log the deletion request
	usernameStr := "N/A"
	if req.Username != nil && *req.Username != "" {
		usernameStr = *req.Username
	}

	log.Printf("Data Deletion Request Received - Email: %s, Username: %s, Reason: %s, Timestamp: %s",
		req.Email, usernameStr, req.Reason, time.Now().Format(time.RFC3339))

	// TODO: Store in database or send email notification
	// For now, we'll just log it

	// Return success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Your data deletion request has been received and will be processed within 30 days.",
	})
}
