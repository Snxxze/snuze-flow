package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"snuze-flow/backend/internal/domain"
	"snuze-flow/backend/pkg/apperrors"
)

type UserDB struct {
	ID           string    `db:"id"`
	Email        string    `db:"email"`
	Username     string    `db:"username"`
	PasswordHash string    `db:"password_hash"`
	DisplayName  string    `db:"display_name"`
	CreatedAt    time.Time `db:"created_at"`
}

func (u *UserDB) ToDomain() *domain.User {
	return &domain.User{
		ID:           u.ID,
		Email:        u.Email,
		Username:     u.Username,
		PasswordHash: u.PasswordHash,
		DisplayName:  u.DisplayName,
		CreatedAt:    u.CreatedAt,
	}
}

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, user *domain.User) error {
	query := `
		INSERT INTO users (email, username, password_hash, display_name)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at
	`
	err := r.db.QueryRowContext(ctx, query, user.Email, user.Username, user.PasswordHash, user.DisplayName).
		Scan(&user.ID, &user.CreatedAt)
	if err != nil {
		return fmt.Errorf("failed to insert user: %w", err)
	}
	return nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	query := `
		SELECT id, email, username, password_hash, display_name, created_at
		FROM users
		WHERE email = $1
	`
	var u UserDB
	err := r.db.QueryRowContext(ctx, query, email).
		Scan(&u.ID, &u.Email, &u.Username, &u.PasswordHash, &u.DisplayName, &u.CreatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, apperrors.ErrNotFound
		}
		return nil, fmt.Errorf("failed to query user by email: %w", err)
	}
	return u.ToDomain(), nil
}

func (r *UserRepository) GetByID(ctx context.Context, id string) (*domain.User, error) {
	query := `
		SELECT id, email, username, password_hash, display_name, created_at
		FROM users
		WHERE id = $1
	`
	var u UserDB
	err := r.db.QueryRowContext(ctx, query, id).
		Scan(&u.ID, &u.Email, &u.Username, &u.PasswordHash, &u.DisplayName, &u.CreatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, apperrors.ErrNotFound
		}
		return nil, fmt.Errorf("failed to query user by id: %w", err)
	}
	return u.ToDomain(), nil
}

func (r *UserRepository) ExistsByEmailOrUsername(ctx context.Context, email, username string) (bool, error) {
	query := `
		SELECT EXISTS(
			SELECT 1 FROM users WHERE email = $1 OR username = $2
		)
	`
	var exists bool
	err := r.db.QueryRowContext(ctx, query, email, username).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check user existence: %w", err)
	}
	return exists, nil
}
