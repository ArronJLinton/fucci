# Heroku-optimized Dockerfile
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install necessary build tools
RUN apk add --no-cache git

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Final stage
FROM alpine:latest

WORKDIR /app

# Install ca-certificates for HTTPS requests
RUN apk --no-cache add ca-certificates

# Create a non-root user first (needed for chown)
RUN adduser -D appuser

# Copy the binary from builder
COPY --from=builder /app/main .

# Copy static files (privacy policy, etc.)
COPY --from=builder /app/static/ ./static/

# Ensure appuser can read all files
RUN chown -R appuser:appuser /app
USER appuser

# Expose port (Heroku will set PORT env var)
EXPOSE 8080

# Run the application
CMD ["./main"] 