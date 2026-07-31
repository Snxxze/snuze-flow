package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"snuze-flow/backend/internal/config"
	"snuze-flow/backend/internal/dto"
	"snuze-flow/backend/internal/middleware"
	"snuze-flow/backend/internal/response"
	"snuze-flow/backend/internal/service"
	"snuze-flow/backend/pkg/apperrors"
)

type AuthHandler struct {
	userService *service.UserService
	cfg         *config.Config
}

func NewAuthHandler(userService *service.UserService, cfg *config.Config) *AuthHandler {
	return &AuthHandler{
		userService: userService,
		cfg:         cfg,
	}
}

// Register godoc
// @Summary      Register a new user
// @Description  Creates a new user account and returns JWT token (Disabled during Closed Beta)
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request body dto.RegisterRequest true "User Registration Payload"
// @Success      201 {object} dto.AuthResponse
// @Failure      400 {object} response.ErrorResponse
// @Failure      403 {object} response.ErrorResponse
// @Failure      409 {object} response.ErrorResponse
// @Router       /api/auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	if !h.cfg.AllowPublicRegistration {
		response.Error(c, &apperrors.AppError{
			Code:    "FORBIDDEN",
			Message: "Public registration is disabled during Closed Beta. Account credentials are provisioned by system administrator.",
		})
		return
	}

	var req dto.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, &apperrors.AppError{
			Code:    "BAD_REQUEST",
			Message: "Invalid registration payload",
			Err:     err,
		})
		return
	}

	res, err := h.userService.Register(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, http.StatusCreated, res)
}

// Login godoc
// @Summary      Login user
// @Description  Authenticates credentials and returns JWT token
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request body dto.LoginRequest true "User Login Payload"
// @Success      200 {object} dto.AuthResponse
// @Failure      400 {object} response.ErrorResponse
// @Failure      401 {object} response.ErrorResponse
// @Router       /api/auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, &apperrors.AppError{
			Code:    "BAD_REQUEST",
			Message: "Invalid login payload",
			Err:     err,
		})
		return
	}

	res, err := h.userService.Login(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, http.StatusOK, res)
}

// GetMe godoc
// @Summary      Get current authenticated user profile
// @Description  Returns user profile for the current JWT bearer
// @Tags         auth
// @Produce      json
// @Security     BearerAuth
// @Success      200 {object} dto.UserResponse
// @Failure      401 {object} response.ErrorResponse
// @Router       /api/auth/me [get]
func (h *AuthHandler) GetMe(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		response.Error(c, &apperrors.AppError{
			Code:    "UNAUTHORIZED",
			Message: "Unauthorized request context",
			Err:     err,
		})
		return
	}

	user, err := h.userService.GetMe(c.Request.Context(), userID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, http.StatusOK, user)
}
