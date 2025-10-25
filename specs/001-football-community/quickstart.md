# Quickstart Guide: Football Community Platform

**Date**: 2025-01-23  
**Feature**: Football Community Platform  
**Target**: Developers setting up the development environment

## Branch Organization

Each phase is implemented under its own branch for better organization and parallel development:

1. **`001-setup-foundational`**: Phase 1-2 - Setup & Foundational (blocking prerequisites)
2. **`002-live-match-following`**: Phase 3 - User Story 1 - Live Match Following (P1) - **MVP**
3. **`003-ai-debate-engagement`**: Phase 4 - User Story 2 - AI-Powered Debate Engagement (P2)
4. **`004-community-team-management`**: Phase 5 - User Story 3 - Community Team Management (P3)
5. **`005-media-driven-engagement`**: Phase 6 - User Story 4 - Media-Driven Engagement (P4)
6. **`006-polish-cross-cutting`**: Phase 7 - Polish & Cross-Cutting Concerns

## Prerequisites

### System Requirements

- **Node.js**: 18.x or later
- **Go**: 1.22 or later
- **PostgreSQL**: 15 or later
- **Redis**: 7.x or later
- **Docker**: 20.x or later (optional, for containerized development)
- **Git**: 2.x or later

### Development Tools

- **VS Code** (recommended) with extensions:
  - Go
  - TypeScript and JavaScript Language Features
  - React Native Tools
  - PostgreSQL
- **Expo CLI**: `npm install -g @expo/cli`
- **Go tools**: `go install golang.org/x/tools/gopls@latest`

## Branch Workflow

### Development Process

1. **Start with foundational branch**: `git checkout -b 001-setup-foundational`
2. **Complete phase tasks**: Implement all tasks for the current phase
3. **Test independently**: Ensure the phase meets its independent test criteria
4. **Create PR**: Submit pull request for review
5. **Merge to main**: After approval, merge to main branch
6. **Move to next phase**: Create new branch for next phase

### Branch Creation Commands

```bash
# Create and switch to foundational branch
git checkout -b 001-setup-foundational

# After completing foundational work, create MVP branch
git checkout -b 002-live-match-following

# Continue with subsequent phases
git checkout -b 003-ai-debate-engagement
git checkout -b 004-community-team-management
git checkout -b 005-media-driven-engagement
git checkout -b 006-polish-cross-cutting
```

## Environment Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd Fucci

# Install root dependencies
yarn install

# Install mobile app dependencies
cd apps/mobile
yarn install

# Install API dependencies
cd ../../services/api
go mod download
```

### 2. Database Setup

```bash
# Start PostgreSQL and Redis (using Docker)
docker-compose -f services/api/docker-compose.yml up -d

# Or install locally:
# PostgreSQL: https://www.postgresql.org/download/
# Redis: https://redis.io/download

# Create database
createdb fucci_dev

# Run migrations
cd services/api
go run cmd/migrate/main.go up
```

### 3. Environment Configuration

Create environment files:

**`.env` (root directory)**:

```bash
# Database
DATABASE_URL=postgres://user:password@localhost:5432/fucci_dev
REDIS_URL=redis://localhost:6379

# API Configuration
API_PORT=8080
JWT_SECRET=your-jwt-secret-key
API_FOOTBALL_KEY=your-api-football-key
OPENAI_API_KEY=your-openai-api-key
NEWS_API_KEY=your-news-api-key

# AWS Configuration (for production)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=fucci-media
```

**`apps/mobile/.env`**:

```bash
# API Configuration
API_BASE_URL=http://localhost:8080/v1
WS_URL=ws://localhost:8080/ws

# App Configuration
APP_NAME=Fucci
APP_VERSION=1.0.0
NODE_ENV=development
DEBUG=true
```

### 4. Start Development Servers

**Terminal 1 - API Server**:

```bash
cd services/api
go run main.go
# Server starts on http://localhost:8080
```

**Terminal 2 - Mobile App**:

```bash
cd apps/mobile
yarn start
# Expo DevTools opens in browser
# Scan QR code with Expo Go app
```

**Terminal 3 - Database Monitoring** (optional):

```bash
# Monitor PostgreSQL
psql fucci_dev

# Monitor Redis
redis-cli monitor
```

## Development Workflow

### 1. Mobile App Development

```bash
cd apps/mobile

# Start development server
yarn start

# Run on iOS simulator
yarn ios

# Run on Android emulator
yarn android

# Run tests
yarn test

# Type checking
yarn type-check

# Linting
yarn lint
```

### 2. API Development

```bash
cd services/api

# Run server
go run main.go

# Run tests
go test ./...

# Run specific test
go test ./internal/api -v

# Generate mocks
go generate ./...

# Database migrations
go run cmd/migrate/main.go up
go run cmd/migrate/main.go down
```

### 3. Database Operations

```bash
# Connect to database
psql fucci_dev

# View tables
\dt

# View table structure
\d users

# Run SQL queries
SELECT * FROM users LIMIT 5;

# Exit
\q
```

## Testing

### Mobile App Tests

```bash
cd apps/mobile

# Unit tests
yarn test

# E2E tests (requires device/emulator)
yarn test:e2e

# Test coverage
yarn test:coverage
```

### API Tests

```bash
cd services/api

# All tests
go test ./...

# With coverage
go test -cover ./...

# Integration tests
go test -tags=integration ./...

# Load testing
go test -tags=load ./internal/api
```

## Common Development Tasks

### 1. Adding a New API Endpoint

1. **Define route in `internal/api/api.go`**:

```go
api.GET("/teams", handlers.GetTeams)
```

2. **Create handler in `internal/api/teams.go`**:

```go
func GetTeams(c *gin.Context) {
    // Implementation
}
```

3. **Add tests in `internal/api/teams_test.go`**:

```go
func TestGetTeams(t *testing.T) {
    // Test implementation
}
```

4. **Update OpenAPI spec in `contracts/api.yaml`**

### 2. Adding a New Mobile Screen

1. **Create screen component**:

```typescript
// src/screens/NewScreen.tsx
import React from 'react';
import { View, Text } from 'react-native';

export default function NewScreen() {
  return (
    <View>
      <Text>New Screen</Text>
    </View>
  );
}
```

2. **Add to navigation**:

```typescript
// App.tsx
import NewScreen from './src/screens/NewScreen';

// Add to Stack.Navigator
<Stack.Screen name="NewScreen" component={NewScreen} />;
```

3. **Add tests**:

```typescript
// __tests__/NewScreen.test.tsx
import { render } from '@testing-library/react-native';
import NewScreen from '../src/screens/NewScreen';

test('renders new screen', () => {
  const { getByText } = render(<NewScreen />);
  expect(getByText('New Screen')).toBeTruthy();
});
```

### 3. Database Schema Changes

1. **Create migration**:

```bash
cd services/api
go run cmd/migrate/main.go create add_new_column
```

2. **Edit migration file**:

```sql
-- sql/migrations/xxx_add_new_column.sql
ALTER TABLE users ADD COLUMN new_field VARCHAR(100);
```

3. **Run migration**:

```bash
go run cmd/migrate/main.go up
```

4. **Update models**:

```go
// internal/database/models.go
type User struct {
    // ... existing fields
    NewField string `json:"new_field" db:"new_field"`
}
```

## Debugging

### Mobile App Debugging

```bash
# Enable debug mode
export DEBUG=true

# View logs
yarn start --verbose

# Debug on device
# Shake device -> Debug -> Open Debugger
```

### API Debugging

```bash
# Enable debug logging
export LOG_LEVEL=debug

# Run with race detection
go run -race main.go

# Profile performance
go run main.go -cpuprofile=cpu.prof
go tool pprof cpu.prof
```

### Database Debugging

```bash
# Enable query logging
export DB_DEBUG=true

# View slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

## Deployment

### Development Deployment

```bash
# Build mobile app
cd apps/mobile
yarn build

# Build API
cd ../../services/api
go build -o bin/api main.go

# Run with production config
./bin/api -config=config/production.yaml
```

### Production Deployment

```bash
# Build Docker images
docker build -t fucci-api services/api/
docker build -t fucci-mobile apps/mobile/

# Deploy with Terraform
cd infra/terraform
terraform init
terraform plan
terraform apply
```

## Troubleshooting

### Common Issues

**1. Metro bundler not starting**:

```bash
cd apps/mobile
yarn start --reset-cache
```

**2. Database connection failed**:

```bash
# Check if PostgreSQL is running
pg_isready

# Check connection string
echo $DATABASE_URL
```

**3. Go modules issues**:

```bash
cd services/api
go mod tidy
go mod download
```

**4. Redis connection failed**:

```bash
# Check if Redis is running
redis-cli ping

# Should return PONG
```

**5. Expo app not loading**:

```bash
# Clear Expo cache
expo r -c

# Check network connectivity
ping api.fucci.app
```

### Performance Issues

**1. Slow API responses**:

- Check database query performance
- Verify Redis caching is working
- Monitor memory usage

**2. Mobile app slow loading**:

- Check bundle size: `yarn analyze`
- Verify image optimization
- Monitor network requests

**3. Database slow queries**:

```sql
-- Check slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC;
```

## Getting Help

### Documentation

- **API Documentation**: `/contracts/api.yaml`
- **Data Model**: `/specs/001-football-community/data-model.md`
- **Research**: `/specs/001-football-community/research.md`

### Support Channels

- **GitHub Issues**: Report bugs and feature requests
- **Slack**: #fucci-dev channel for development discussions
- **Wiki**: Internal documentation and guides

### Code Review Process

1. Create feature branch from `main`
2. Make changes with tests
3. Run all tests and linting
4. Create pull request
5. Get 2 approvals before merge
6. Deploy to staging for testing

## Next Steps

1. **Complete setup** following this guide
2. **Run the test suite** to verify everything works
3. **Explore the codebase** starting with the mobile app
4. **Read the API documentation** in `/contracts/api.yaml`
5. **Join the development team** on Slack

Welcome to the Fucci development team! 🚀
