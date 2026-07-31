package response

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"snuze-flow/backend/pkg/apperrors"
)

type PaginationMeta struct {
	Page       int `json:"page"`
	PageSize   int `json:"pageSize"`
	Total      int `json:"total"`
	TotalPages int `json:"totalPages"`
}

func Success(c *gin.Context, code int, data interface{}) {
	reqID, _ := c.Get("requestId")
	c.JSON(code, gin.H{
		"data":      data,
		"requestId": reqID,
	})
}

func SuccessList(c *gin.Context, code int, data interface{}, meta PaginationMeta) {
	reqID, _ := c.Get("requestId")
	c.JSON(code, gin.H{
		"data":      data,
		"meta":      meta,
		"requestId": reqID,
	})
}

func Error(c *gin.Context, err error) {
	reqID, _ := c.Get("requestId")

	var appErr *apperrors.AppError
	if errors.As(err, &appErr) {
		status := AppErrorToHTTPStatus(appErr.Code)
		c.JSON(status, gin.H{
			"error":     appErr,
			"requestId": reqID,
		})
		return
	}

	// Default Fallback
	c.JSON(http.StatusInternalServerError, gin.H{
		"error": gin.H{
			"code":    "INTERNAL_SERVER_ERROR",
			"message": "An unexpected error occurred",
		},
		"requestId": reqID,
	})
}

func AppErrorToHTTPStatus(code string) int {
	switch code {
	case "BAD_REQUEST", "VALIDATION_ERROR":
		return http.StatusBadRequest
	case "UNAUTHORIZED":
		return http.StatusUnauthorized
	case "FORBIDDEN":
		return http.StatusForbidden
	case "NOT_FOUND":
		return http.StatusNotFound
	case "CONFLICT":
		return http.StatusConflict
	default:
		return http.StatusInternalServerError
	}
}
