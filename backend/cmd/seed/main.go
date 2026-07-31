package main

import (
	"context"
	"database/sql"
	"log"

	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
	"snuze-flow/backend/internal/config"
)

type SeedUser struct {
	Email       string
	Username    string
	Password    string
	DisplayName string
}

func main() {
	cfg := config.LoadConfig()

	db, err := sql.Open("postgres", cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("failed to ping database: %v", err)
	}

	testUsers := []SeedUser{
		{
			Email:       "demo@snuzeflow.com",
			Username:    "demouser",
			Password:    "password123",
			DisplayName: "Demo User",
		},
		{
			Email:       "alex@snuzeflow.com",
			Username:    "alex",
			Password:    "password123",
			DisplayName: "Alex Rivera",
		},
	}

	ctx := context.Background()

	for _, u := range testUsers {
		var exists bool
		err := db.QueryRowContext(ctx, "SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)", u.Email).Scan(&exists)
		if err != nil {
			log.Fatalf("failed to check existence for %s: %v", u.Email, err)
		}

		if exists {
			log.Printf("seed user %s already exists, skipping...", u.Email)
			continue
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), 12)
		if err != nil {
			log.Fatalf("failed to hash password for %s: %v", u.Email, err)
		}

		query := `
			INSERT INTO users (email, username, password_hash, display_name)
			VALUES ($1, $2, $3, $4)
		`
		_, err = db.ExecContext(ctx, query, u.Email, u.Username, string(hashedPassword), u.DisplayName)
		if err != nil {
			log.Fatalf("failed to insert seed user %s: %v", u.Email, err)
		}

		log.Printf("successfully seeded user: %s (@%s)", u.Email, u.Username)
	}

	log.Println("database seeding completed successfully")
}
