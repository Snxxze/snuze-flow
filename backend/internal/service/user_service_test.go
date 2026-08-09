package service_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"golang.org/x/crypto/bcrypt"

	"snuze-flow/backend/internal/config"
	"snuze-flow/backend/internal/domain"
	"snuze-flow/backend/internal/dto"
	"snuze-flow/backend/internal/service"
	"snuze-flow/backend/pkg/apperrors"
)

// mockUserRepository implements service.UserRepository for testing
type mockUserRepository struct {
	users map[string]*domain.User
}

func newMockUserRepository() *mockUserRepository {
	return &mockUserRepository{
		users: make(map[string]*domain.User),
	}
}

func (m *mockUserRepository) Create(ctx context.Context, user *domain.User) error {
	if user.ID == "" {
		user.ID = "test-user-uuid-1"
	}
	user.CreatedAt = time.Now()
	m.users[user.Email] = user
	return nil
}

func (m *mockUserRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	u, exists := m.users[email]
	if !exists {
		return nil, apperrors.ErrNotFound
	}
	return u, nil
}

func (m *mockUserRepository) GetByID(ctx context.Context, id string) (*domain.User, error) {
	for _, u := range m.users {
		if u.ID == id {
			return u, nil
		}
	}
	return nil, apperrors.ErrNotFound
}

func (m *mockUserRepository) ExistsByEmailOrUsername(ctx context.Context, email, username string) (bool, error) {
	for _, u := range m.users {
		if u.Email == email || u.Username == username {
			return true, nil
		}
	}
	return false, nil
}

func TestUserService_Register_Success(t *testing.T) {
	repo := newMockUserRepository()
	cfg := &config.Config{
		JWTSecret:      "test-secret-key-12345",
		JWTExpiryHours: 24,
	}
	svc := service.NewUserService(repo, cfg)

	req := &dto.RegisterRequest{
		Email:       "  TEST.USER@EXAMPLE.COM  ",
		Username:    "  TestUser  ",
		DisplayName: "Test User",
		Password:    "password123",
	}

	resp, err := svc.Register(context.Background(), req)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if resp.Token == "" {
		t.Errorf("expected token to be generated")
	}

	if resp.User.Email != "test.user@example.com" {
		t.Errorf("expected sanitized email 'test.user@example.com', got '%s'", resp.User.Email)
	}

	if resp.User.Username != "testuser" {
		t.Errorf("expected sanitized username 'testuser', got '%s'", resp.User.Username)
	}
}

func TestUserService_Register_DuplicateConflict(t *testing.T) {
	repo := newMockUserRepository()
	cfg := &config.Config{JWTSecret: "secret", JWTExpiryHours: 24}
	svc := service.NewUserService(repo, cfg)

	// Pre-seed user
	repo.users["existing@example.com"] = &domain.User{
		ID:       "user-1",
		Email:    "existing@example.com",
		Username: "existinguser",
	}

	req := &dto.RegisterRequest{
		Email:       "existing@example.com",
		Username:    "newuser",
		DisplayName: "New User",
		Password:    "password123",
	}

	_, err := svc.Register(context.Background(), req)
	if err == nil {
		t.Fatalf("expected conflict error, got nil")
	}

	var appErr *apperrors.AppError
	if !errors.As(err, &appErr) || appErr.Code != "CONFLICT" {
		t.Errorf("expected AppError CONFLICT, got %v", err)
	}
}

func TestUserService_Login_Success(t *testing.T) {
	repo := newMockUserRepository()
	cfg := &config.Config{JWTSecret: "secret", JWTExpiryHours: 24}
	svc := service.NewUserService(repo, cfg)

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("correctpassword"), 12)
	repo.users["login@example.com"] = &domain.User{
		ID:           "login-user-id",
		Email:        "login@example.com",
		Username:     "loginuser",
		DisplayName:  "Login User",
		PasswordHash: string(hashedPassword),
	}

	req := &dto.LoginRequest{
		Email:    "LOGIN@EXAMPLE.COM",
		Password: "correctpassword",
	}

	resp, err := svc.Login(context.Background(), req)
	if err != nil {
		t.Fatalf("expected successful login, got error: %v", err)
	}

	if resp.User.ID != "login-user-id" {
		t.Errorf("expected user ID 'login-user-id', got '%s'", resp.User.ID)
	}

	if resp.Token == "" {
		t.Errorf("expected JWT token string")
	}
}

func TestUserService_Login_InvalidPassword(t *testing.T) {
	repo := newMockUserRepository()
	cfg := &config.Config{JWTSecret: "secret", JWTExpiryHours: 24}
	svc := service.NewUserService(repo, cfg)

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("correctpassword"), 12)
	repo.users["login@example.com"] = &domain.User{
		ID:           "login-user-id",
		Email:        "login@example.com",
		PasswordHash: string(hashedPassword),
	}

	req := &dto.LoginRequest{
		Email:    "login@example.com",
		Password: "wrongpassword",
	}

	_, err := svc.Login(context.Background(), req)
	if err == nil {
		t.Fatalf("expected unauthorized error on wrong password, got nil")
	}

	var appErr *apperrors.AppError
	if !errors.As(err, &appErr) || appErr.Code != "UNAUTHORIZED" {
		t.Errorf("expected AppError UNAUTHORIZED, got %v", err)
	}
}

func TestUserService_GetMe_Success(t *testing.T) {
	repo := newMockUserRepository()
	cfg := &config.Config{JWTSecret: "secret", JWTExpiryHours: 24}
	svc := service.NewUserService(repo, cfg)

	repo.users["me@example.com"] = &domain.User{
		ID:          "user-me-123",
		Email:       "me@example.com",
		Username:    "meuser",
		DisplayName: "Me User",
		Role:        "member",
	}

	resp, err := svc.GetMe(context.Background(), "user-me-123")
	if err != nil {
		t.Fatalf("expected no error fetching profile, got %v", err)
	}

	if resp.Username != "meuser" {
		t.Errorf("expected username 'meuser', got '%s'", resp.Username)
	}
}
