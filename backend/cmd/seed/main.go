package main

import (
	"context"
	"database/sql"
	"log"
	"os"

	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
	"snuze-flow/backend/internal/config"
)

type SeedUser struct {
	Email       string
	Username    string
	Password    string
	DisplayName string
	Role        string
}

func getEnvOrDefault(key, defaultValue string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultValue
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

	adminEmail := getEnvOrDefault("ADMIN_EMAIL", "admin@snuzeflow.com")
	adminUsername := getEnvOrDefault("ADMIN_USERNAME", "admin")
	adminPassword := getEnvOrDefault("ADMIN_PASSWORD", "AdminPass123!")
	adminDisplayName := getEnvOrDefault("ADMIN_DISPLAY_NAME", "System Admin")

	testUsers := []SeedUser{
		{
			Email:       adminEmail,
			Username:    adminUsername,
			Password:    adminPassword,
			DisplayName: adminDisplayName,
			Role:        "admin",
		},
		{
			Email:       "demo@snuzeflow.com",
			Username:    "demouser",
			Password:    "password123",
			DisplayName: "Demo User",
			Role:        "user",
		},
		{
			Email:       "alex@snuzeflow.com",
			Username:    "alex",
			Password:    "password123",
			DisplayName: "Alex Rivera",
			Role:        "user",
		},
	}

	ctx := context.Background()

	for _, u := range testUsers {
		var exists bool
		err := db.QueryRowContext(ctx, "SELECT EXISTS(SELECT 1 FROM users WHERE email = $1 OR username = $2)", u.Email, u.Username).Scan(&exists)
		if err != nil {
			log.Fatalf("failed to check existence for %s: %v", u.Email, err)
		}

		if exists {
			log.Printf("seed user %s (@%s) already exists, skipping...", u.Email, u.Username)
			continue
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), 12)
		if err != nil {
			log.Fatalf("failed to hash password for %s: %v", u.Email, err)
		}

		query := `
			INSERT INTO users (email, username, password_hash, display_name, role)
			VALUES ($1, $2, $3, $4, $5)
		`
		_, err = db.ExecContext(ctx, query, u.Email, u.Username, string(hashedPassword), u.DisplayName, u.Role)
		if err != nil {
			log.Fatalf("failed to insert seed user %s: %v", u.Email, err)
		}

		log.Printf("successfully seeded user: %s (@%s) [role: %s]", u.Email, u.Username, u.Role)
	}

	log.Println("database seeding completed successfully")
}
