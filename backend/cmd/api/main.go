package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"snuze-flow/backend/internal/config"
	"snuze-flow/backend/internal/handler"
	"snuze-flow/backend/internal/middleware"
	"snuze-flow/backend/internal/repository"
	"snuze-flow/backend/internal/response"
	"snuze-flow/backend/internal/service"
)

func main() {
	logger := config.InitLogger()
	cfg := config.LoadConfig()
	logger.Info("starting snuze-flow backend service...", "env", cfg.Environment)

	// Connect Database - Fail Fast if DB connection fails
	db, err := config.ConnectDB()
	if err != nil {
		logger.Error(fmt.Sprintf("database connection failed: %v", err))
		os.Exit(1)
	}
	defer db.Close()
	logger.Info("database connected successfully")

	// Dependency Injection Wiring (Explicit Manual Constructors)
	userRepo := repository.NewUserRepository(db)
	userService := service.NewUserService(userRepo, cfg)
	authHandler := handler.NewAuthHandler(userService, cfg)

	projectRepo := repository.NewProjectRepository(db)
	projectService := service.NewProjectService(projectRepo, userRepo)
	projectHandler := handler.NewProjectHandler(projectService)

	taskRepo := repository.NewTaskRepository(db)
	taskService := service.NewTaskService(taskRepo, projectRepo, userRepo)
	taskHandler := handler.NewTaskHandler(taskService)

	subtaskRepo := repository.NewSubtaskRepository(db)
	subtaskService := service.NewSubtaskService(subtaskRepo, taskRepo, projectRepo)
	subtaskHandler := handler.NewSubtaskHandler(subtaskService)

	r := gin.New()
	r.Use(gin.Recovery())
	if cfg.Environment == "development" {
		r.Use(gin.Logger())
	}
	r.Use(middleware.RequestID())
	r.Use(middleware.RequestLogger(logger))

	// CORS Setup
	r.Use(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if origin != "" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		}
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With, X-Request-ID")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, PATCH, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Health Check
	r.GET("/health", func(c *gin.Context) {
		response.Success(c, http.StatusOK, gin.H{
			"status": "healthy",
			"app":    "SnuzeFlow API",
		})
	})

	// Public Auth Group
	authGroup := r.Group("/api/auth")
	{
		authGroup.POST("/register", authHandler.Register)
		authGroup.POST("/login", authHandler.Login)
		authGroup.GET("/me", middleware.AuthMiddleware(cfg.JWTSecret), authHandler.GetMe)
	}

	// Protected Group
	protected := r.Group("/api", middleware.AuthMiddleware(cfg.JWTSecret))
	{
		// Dashboard
		protected.GET("/dashboard", taskHandler.GetDashboardTasks)

		// Projects & Invitations
		protected.POST("/projects", projectHandler.CreateProject)
		protected.GET("/projects", projectHandler.ListProjects)
		protected.GET("/projects/:id", projectHandler.GetProjectDetail)
		protected.PATCH("/projects/:id", projectHandler.UpdateProject)
		protected.DELETE("/projects/:id", projectHandler.DeleteProject)
		protected.GET("/projects/:id/stats", projectHandler.GetProjectStats)
		protected.POST("/projects/:id/invitations", projectHandler.InviteMember)

		protected.GET("/invitations", projectHandler.ListPendingInvitations)
		protected.PUT("/invitations/:id/respond", projectHandler.RespondInvitation)
		protected.POST("/invitations/:id/accept", projectHandler.AcceptInvitation)
		protected.POST("/invitations/:id/reject", projectHandler.RejectInvitation)

		// Tasks
		protected.POST("/projects/:id/tasks", taskHandler.CreateTask)
		protected.GET("/projects/:id/tasks", taskHandler.ListTasks)
		protected.PATCH("/tasks/:id", taskHandler.UpdateTask)
		protected.PATCH("/tasks/:id/status", taskHandler.UpdateTaskStatus)
		protected.DELETE("/tasks/:id", taskHandler.DeleteTask)

		// Subtasks
		protected.POST("/tasks/:id/subtasks", subtaskHandler.CreateSubtask)
		protected.GET("/tasks/:id/subtasks", subtaskHandler.ListSubtasks)
		protected.PATCH("/subtasks/:id/status", subtaskHandler.ToggleSubtaskStatus)
		protected.DELETE("/subtasks/:id", subtaskHandler.DeleteSubtask)
	}

	logger.Info(fmt.Sprintf("server listening on port %s", cfg.Port))
	if err := r.Run(":" + cfg.Port); err != nil {
		logger.Error(fmt.Sprintf("failed to run server: %v", err))
	}
}
