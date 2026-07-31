package main

import (
	"fmt"
	"os"

	"snuze-flow/backend/internal/config"
)

func main() {
	logger := config.InitLogger()
	logger.Info("testing Neon PostgreSQL database connection...")

	db, err := config.ConnectDB()
	if err != nil {
		logger.Error(fmt.Sprintf("database connection test failed: %v", err))
		os.Exit(1)
	}
	defer db.Close()

	var currentDB string
	err = db.QueryRow("SELECT current_database()").Scan(&currentDB)
	if err != nil {
		logger.Error(fmt.Sprintf("failed to query database name: %v", err))
		os.Exit(1)
	}

	logger.Info("connection successful", "database", currentDB)
}
