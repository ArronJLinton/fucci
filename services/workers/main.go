package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"go.uber.org/zap"
)

func main() {
	// Initialize logger
	logger, err := zap.NewProduction()
	if err != nil {
		log.Fatal("Failed to initialize logger:", err)
	}
	defer logger.Sync()

	logger.Info("Starting Fucci Workers service...")

	// Create context with cancellation
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Start workers
	logger.Info("Starting background workers...")

	// TODO: Implement actual workers
	// - Debate generation worker
	// - Media processing worker
	// - Notification worker
	// - Data aggregation worker

	// Wait for interrupt signal
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	select {
	case sig := <-sigChan:
		logger.Info("Received signal, shutting down gracefully", zap.String("signal", sig.String()))
		cancel()
	case <-ctx.Done():
		logger.Info("Context cancelled, shutting down")
	}

	// Graceful shutdown
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer shutdownCancel()

	logger.Info("Shutting down workers...")

	// TODO: Implement graceful shutdown for workers
	_ = shutdownCtx // Use shutdownCtx for graceful shutdown implementation

	logger.Info("Workers service stopped")
}
