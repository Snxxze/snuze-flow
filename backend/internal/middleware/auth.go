package middleware

import (
	"errors"
	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"snuze-flow/backend/internal/response"
	"snuze-flow/backend/pkg/apperrors"
)

func AuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.Error(c, &apperrors.AppError{
				Code:    "UNAUTHORIZED",
				Message: "Authorization header is required",
				Err:     apperrors.ErrUnauthorized,
			})
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && strings.ToLower(parts[0]) == "bearer") {
			response.Error(c, &apperrors.AppError{
				Code:    "UNAUTHORIZED",
				Message: "Authorization header format must be Bearer {token}",
				Err:     apperrors.ErrUnauthorized,
			})
			c.Abort()
			return
		}

		tokenString := parts[1]

		token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
			}
			return []byte(jwtSecret), nil
		})

		if err != nil || !token.Valid {
			response.Error(c, &apperrors.AppError{
				Code:    "UNAUTHORIZED",
				Message: "Invalid or expired token",
				Err:     apperrors.ErrUnauthorized,
			})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			response.Error(c, &apperrors.AppError{
				Code:    "UNAUTHORIZED",
				Message: "Invalid token claims",
				Err:     apperrors.ErrUnauthorized,
			})
			c.Abort()
			return
		}

		userID, ok := claims["sub"].(string)
		if !ok || userID == "" {
			response.Error(c, &apperrors.AppError{
				Code:    "UNAUTHORIZED",
				Message: "Token claims missing user ID",
				Err:     apperrors.ErrUnauthorized,
			})
			c.Abort()
			return
		}

		c.Set("userID", userID)
		c.Next()
	}
}

func GetUserIDFromContext(c *gin.Context) (string, error) {
	val, exists := c.Get("userID")
	if !exists {
		return "", errors.New("user ID not found in context")
	}

	userID, ok := val.(string)
	if !ok || userID == "" {
		return "", errors.New("invalid user ID type in context")
	}

	return userID, nil
}
