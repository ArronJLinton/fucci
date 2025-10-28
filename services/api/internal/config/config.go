package config

import (
	"strings"

	"github.com/spf13/viper"
	"github.com/uptrace/opentelemetry-go-extra/otelzap"
	"go.uber.org/zap"
)

// InitConfig initializes the application configuration
func InitConfig(logger *otelzap.Logger) Config {
	viper.SetConfigName(".env")         // name of config file (without extension)
	viper.SetConfigType("env")          // REQUIRED if the config file does not have the extension in the name
	viper.AddConfigPath("../../../../") // look for config in the project root directory

	// Set up environment variables
	viper.AutomaticEnv()
	viper.SetEnvKeyReplacer(strings.NewReplacer(`.`, `_`))

	// Set defaults
	viper.SetDefault("db_url", "postgres://arronlinton@localhost:5431/joga_bonito?sslmode=disable")
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
