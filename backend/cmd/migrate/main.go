package main

import (
	"log"
	"os"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"snuze-flow/backend/internal/config"
)

func main() {
	cfg := config.LoadConfig()

	action := "up"
	if len(os.Args) > 1 {
		action = os.Args[1]
	}

	migrationsPath := "file://migrations"
	if _, err := os.Stat("migrations"); os.IsNotExist(err) {
		migrationsPath = "file://backend/migrations"
	}

	m, err := migrate.New(migrationsPath, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("failed to initialize migration engine: %v", err)
	}
	defer m.Close()

	switch action {
	case "up":
		if err := m.Up(); err != nil && err != migrate.ErrNoChange {
			log.Fatalf("failed to apply up migrations: %v", err)
		}
		log.Println("database migrations applied successfully (UP)")

	case "down":
		if err := m.Down(); err != nil && err != migrate.ErrNoChange {
			log.Fatalf("failed to apply down migrations: %v", err)
		}
		log.Println("database migrations rolled back successfully (DOWN)")

	default:
		log.Printf("unknown command: %s. Use 'up' or 'down'\n", action)
		os.Exit(1)
	}
}
