package config

import (
	"os"
	"strings"

	"github.com/spf13/viper"
	"github.com/uptrace/opentelemetry-go-extra/otelzap"
	"go.uber.org/zap"
)

// InitConfig initializes the application configuration
func InitConfig(logger *otelzap.Logger) Config {
	viper.SetConfigName(".env") // name of config file (without extension)
	viper.SetConfigType("env")  // REQUIRED if the config file does not have the extension in the name

	// Add multiple search paths to find .env file
	// Paths are relative to where the command is executed
	cwd, _ := os.Getwd()
	logger.Info("Searching for .env file", zap.String("current_dir", cwd))

	// Try common locations relative to current working directory
	viper.AddConfigPath(".")      // Current directory
	viper.AddConfigPath("../")    // Parent directory
	viper.AddConfigPath("../../") // Two levels up

	// Try absolute paths based on common project structure
	// When running from services/api/, go up one level
	if cwd != "" {
		logger.Info("Searching via absolute paths", zap.String("current_dir", cwd))

		viper.AddConfigPath(cwd)
		viper.AddConfigPath(cwd + "/..")
		viper.AddConfigPath(cwd + "/../..")
	}

	// Set up environment variables
	viper.AutomaticEnv()
	viper.SetEnvKeyReplacer(strings.NewReplacer(`.`, `_`))

	// Set defaults
	viper.SetDefault("db_url", "")
	viper.SetDefault("redis_url", "redis://localhost:6379")
	viper.SetDefault("openai_base_url", "https://api.openai.com/v1")
	viper.SetDefault("port", "8080")
	viper.SetDefault("environment", "development")

	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			logger.Info("No .env file found, using environment variables")
		} else {
			logger.Error("Error reading config file", zap.Error(err))
		}
	} else {
		logger.Info("Found .env file", zap.String("file", viper.ConfigFileUsed()))
	}

	return Config{
		DB_URL:           viper.GetString("db_url"),
		FOOTBALL_API_KEY: viper.GetString("football_api_key"),
		RAPID_API_KEY:    viper.GetString("rapid_api_key"),
		REDIS_URL:        viper.GetString("redis_url"),
		OPENAI_API_KEY:   viper.GetString("openai_api_key"),
		OPENAI_BASE_URL:  viper.GetString("openai_base_url"),
		PORT:             viper.GetString("port"),
		ENVIRONMENT:      viper.GetString("environment"),
		JWT_SECRET:       viper.GetString("jwt_secret"),
	}
}
