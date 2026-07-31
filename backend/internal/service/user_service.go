package service

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"snuze-flow/backend/internal/config"
	"snuze-flow/backend/internal/domain"
	"snuze-flow/backend/internal/dto"
	"snuze-flow/backend/pkg/apperrors"
)

// UserRepository defined in consumer service package per architecture rules
type UserRepository interface {
	Create(ctx context.Context, user *domain.User) error
	GetByEmail(ctx context.Context, email string) (*domain.User, error)
	GetByID(ctx context.Context, id string) (*domain.User, error)
	ExistsByEmailOrUsername(ctx context.Context, email, username string) (bool, error)
}

type UserService struct {
	repo   UserRepository
	config *config.Config
}

func NewUserService(repo UserRepository, cfg *config.Config) *UserService {
	return &UserService{
		repo:   repo,
		config: cfg,
	}
}

func (s *UserService) Register(ctx context.Context, req *dto.RegisterRequest) (*dto.AuthResponse, error) {
	// Data Sanitization
	cleanEmail := strings.TrimSpace(strings.ToLower(req.Email))
	cleanUsername := strings.TrimSpace(strings.ToLower(req.Username))
	cleanDisplayName := strings.TrimSpace(req.DisplayName)

	exists, err := s.repo.ExistsByEmailOrUsername(ctx, cleanEmail, cleanUsername)
	if err != nil {
		return nil, fmt.Errorf("error checking existing user: %w", err)
	}
	if exists {
		return nil, &apperrors.AppError{
			Code:    "CONFLICT",
			Message: "Email or username is already registered",
			Err:     apperrors.ErrConflict,
		}
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), 12)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	newUser := &domain.User{
		Email:        cleanEmail,
		Username:     cleanUsername,
		PasswordHash: string(hashedPassword),
		DisplayName:  cleanDisplayName,
	}

	if err := s.repo.Create(ctx, newUser); err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	token, err := s.generateJWTToken(newUser.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate jwt token: %w", err)
	}

	return &dto.AuthResponse{
		Token: token,
		User: dto.UserResponse{
			ID:          newUser.ID,
			Email:       newUser.Email,
			Username:    newUser.Username,
			DisplayName: newUser.DisplayName,
			Role:        newUser.Role,
			CreatedAt:   newUser.CreatedAt.Format(time.RFC3339),
		},
	}, nil
}

func (s *UserService) Login(ctx context.Context, req *dto.LoginRequest) (*dto.AuthResponse, error) {
	cleanEmail := strings.TrimSpace(strings.ToLower(req.Email))

	user, err := s.repo.GetByEmail(ctx, cleanEmail)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, &apperrors.AppError{
				Code:    "UNAUTHORIZED",
				Message: "Invalid email or password",
				Err:     apperrors.ErrUnauthorized,
			}
		}
		return nil, fmt.Errorf("login error: %w", err)
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, &apperrors.AppError{
			Code:    "UNAUTHORIZED",
			Message: "Invalid email or password",
			Err:     apperrors.ErrUnauthorized,
		}
	}

	token, err := s.generateJWTToken(user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate jwt token: %w", err)
	}

	return &dto.AuthResponse{
		Token: token,
		User: dto.UserResponse{
			ID:          user.ID,
			Email:       user.Email,
			Username:    user.Username,
			DisplayName: user.DisplayName,
			Role:        user.Role,
			CreatedAt:   user.CreatedAt.Format(time.RFC3339),
		},
	}, nil
}

func (s *UserService) GetMe(ctx context.Context, userID string) (*dto.UserResponse, error) {
	user, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, &apperrors.AppError{
				Code:    "NOT_FOUND",
				Message: "User profile not found",
				Err:     apperrors.ErrNotFound,
			}
		}
		return nil, fmt.Errorf("error fetching user profile: %w", err)
	}

	return &dto.UserResponse{
		ID:          user.ID,
		Email:       user.Email,
		Username:    user.Username,
		DisplayName: user.DisplayName,
		Role:        user.Role,
		CreatedAt:   user.CreatedAt.Format(time.RFC3339),
	}, nil
}

func (s *UserService) generateJWTToken(userID string) (string, error) {
	claims := jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(time.Duration(s.config.JWTExpiryHours) * time.Hour).Unix(),
		"iat": time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.config.JWTSecret))
}
