package domain

import "time"

type User struct {
	ID           string
	Email        string
	Username     string
	PasswordHash string
	DisplayName  string
	CreatedAt    time.Time
}
