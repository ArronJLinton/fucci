# Fucci Development Makefile
# Provides convenient commands for development workflow

.PHONY: help install build test lint clean dev mobile workers api admin infra

# Default target
help: ## Show this help message
	@echo "Fucci Development Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Installation
install: ## Install all dependencies
	@echo "Installing Node.js dependencies..."
	yarn install
	@echo "Installing Go dependencies..."
	cd services/api && go mod download
	cd services/workers && go mod download

# Building
build: ## Build all applications
	@echo "Building mobile app..."
	yarn workspace Fucci build
	@echo "Building admin app..."
	yarn workspace fucci-admin build
	@echo "Building Go services..."
	cd services/api && go build -o bin/api ./cmd/api
	cd services/workers && go build -o bin/workers ./cmd/workers

# Testing
test: ## Run all tests
	@echo "Running mobile tests..."
	yarn workspace Fucci test
	@echo "Running Go API tests..."
	cd services/api && go test ./...
	@echo "Running Go workers tests..."
	cd services/workers && go test ./...

# Linting
lint: ## Run all linters
	@echo "Linting mobile app..."
	yarn workspace Fucci lint
	@echo "Linting admin app..."
	yarn workspace fucci-admin lint
	@echo "Linting Go API..."
	cd services/api && golangci-lint run
	@echo "Linting Go workers..."
	cd services/workers && golangci-lint run

# Cleaning
clean: ## Clean all build artifacts
	@echo "Cleaning Node.js build artifacts..."
	yarn workspaces run clean
	@echo "Cleaning Go build artifacts..."
	cd services/api && rm -rf bin/
	cd services/workers && rm -rf bin/

# Development servers
dev: ## Start all development servers concurrently
	@echo "Starting all development servers concurrently..."
	yarn dev

dev-api-mobile: ## Start API and mobile app concurrently
	@echo "Starting API and mobile app concurrently..."
	yarn dev:api-mobile

mobile: ## Start mobile development server
	@echo "Starting mobile development server..."
	yarn dev:mobile

api: ## Start API development server
	@echo "Starting API development server..."
	yarn dev:api

workers: ## Start workers development server
	@echo "Starting workers development server..."
	yarn dev:workers

admin: ## Start admin development server
	@echo "Starting admin development server..."
	yarn dev:admin

# Infrastructure
infra-plan: ## Plan infrastructure changes
	@echo "Planning infrastructure changes..."
	cd infra/terraform && terraform plan

infra-apply: ## Apply infrastructure changes
	@echo "Applying infrastructure changes..."
	cd infra/terraform && terraform apply

infra-destroy: ## Destroy infrastructure
	@echo "Destroying infrastructure..."
	cd infra/terraform && terraform destroy

# Database
db-migrate: ## Run database migrations
	@echo "Running database migrations..."
	cd services/api && go run cmd/migrate/main.go

# Code generation
generate: ## Generate code from schemas
	@echo "Generating API client..."
	yarn workspace @fucci/api-schema generate-client
	@echo "Generating Go code..."
	cd services/api && go generate ./...

# Docker
docker-build: ## Build all Docker images
	@echo "Building API Docker image..."
	cd services/api && docker build -t fucci-api .
	@echo "Building workers Docker image..."
	cd services/workers && docker build -t fucci-workers .

docker-run: ## Run services with Docker Compose
	@echo "Starting services with Docker Compose..."
	docker-compose up -d

# Git hooks
setup-hooks: ## Setup git hooks
	@echo "Setting up git hooks..."
	cp tools/scripts/pre-commit .git/hooks/pre-commit
	chmod +x .git/hooks/pre-commit

# Quick development setup
setup: install setup-hooks ## Complete development setup
	@echo "Development setup complete!"
	@echo "Run 'make dev' to start development servers"
