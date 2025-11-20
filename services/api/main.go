package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

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
