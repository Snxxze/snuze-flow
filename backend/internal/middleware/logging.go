package middleware

import (
	"fmt"
	"log/slog"
	"time"

	"github.com/gin-gonic/gin"
)

func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		reqID := c.GetHeader("X-Request-ID")
		if reqID == "" {
			reqID = fmt.Sprintf("req_%d", time.Now().UnixNano())
		}
		c.Set("requestId", reqID)
		c.Header("X-Request-ID", reqID)
		c.Next()
	}
}

func RequestLogger(logger *slog.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		reqID := c.GetString("requestId")

		c.Next()

		latency := time.Since(start)
		status := c.Writer.Status()

		httpGroup := slog.Group("http",
			slog.String("request_id", reqID),
			slog.String("method", c.Request.Method),
			slog.String("path", c.Request.URL.Path),
			slog.Int("status", status),
			slog.Duration("latency", latency),
			slog.String("client_ip", c.ClientIP()),
		)

		if status >= 500 {
			logger.Error("server_error", httpGroup)
		} else if status >= 400 {
			logger.Warn("client_error", httpGroup)
		} else {
			logger.Info("request_completed", httpGroup)
		}
	}
}
