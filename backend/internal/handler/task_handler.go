package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"snuze-flow/backend/internal/dto"
	"snuze-flow/backend/internal/middleware"
	"snuze-flow/backend/internal/response"
	"snuze-flow/backend/internal/service"
	"snuze-flow/backend/pkg/apperrors"
)

type TaskHandler struct {
	taskService *service.TaskService
}

func NewTaskHandler(taskService *service.TaskService) *TaskHandler {
	return &TaskHandler{taskService: taskService}
}

// CreateTask godoc
// @Summary      Create task in project
// @Tags         tasks
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id path string true "Project ID"
// @Param        request body dto.CreateTaskRequest true "Task Payload"
// @Success      201 {object} dto.TaskResponse
// @Router       /api/projects/{id}/tasks [post]
func (h *TaskHandler) CreateTask(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		response.Error(c, &apperrors.AppError{Code: "UNAUTHORIZED", Message: "Unauthorized context", Err: err})
		return
	}

	projectID := c.Param("id")
	var req dto.CreateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, &apperrors.AppError{Code: "BAD_REQUEST", Message: "Invalid task payload", Err: err})
		return
	}

	res, err := h.taskService.CreateTask(c.Request.Context(), projectID, userID, &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, http.StatusCreated, res)
}

// ListTasks godoc
// @Summary      List tasks in project
// @Tags         tasks
// @Produce      json
// @Security     BearerAuth
// @Param        id path string true "Project ID"
// @Success      200 {object} []dto.TaskResponse
// @Router       /api/projects/{id}/tasks [get]
func (h *TaskHandler) ListTasks(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		response.Error(c, &apperrors.AppError{Code: "UNAUTHORIZED", Message: "Unauthorized context", Err: err})
		return
	}

	projectID := c.Param("id")
	res, err := h.taskService.ListTasks(c.Request.Context(), projectID, userID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, http.StatusOK, res)
}

// UpdateTaskStatus godoc
// @Summary      Update task status
// @Tags         tasks
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id path string true "Task ID"
// @Param        request body dto.UpdateTaskStatusRequest true "Task Status Payload"
// @Success      200 {object} map[string]string
// @Router       /api/tasks/{id}/status [patch]
func (h *TaskHandler) UpdateTaskStatus(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		response.Error(c, &apperrors.AppError{Code: "UNAUTHORIZED", Message: "Unauthorized context", Err: err})
		return
	}

	taskID := c.Param("id")
	var req dto.UpdateTaskStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, &apperrors.AppError{Code: "BAD_REQUEST", Message: "Invalid status payload", Err: err})
		return
	}

	if err := h.taskService.UpdateTaskStatus(c.Request.Context(), taskID, userID, &req); err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, http.StatusOK, gin.H{"message": "Task status updated successfully"})
}

// DeleteTask godoc
// @Summary      Delete task
// @Tags         tasks
// @Security     BearerAuth
// @Param        id path string true "Task ID"
// @Success      200 {object} map[string]string
// @Router       /api/tasks/{id} [delete]
func (h *TaskHandler) DeleteTask(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		response.Error(c, &apperrors.AppError{Code: "UNAUTHORIZED", Message: "Unauthorized context", Err: err})
		return
	}

	taskID := c.Param("id")
	if err := h.taskService.DeleteTask(c.Request.Context(), taskID, userID); err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, http.StatusOK, gin.H{"message": "Task deleted successfully"})
}

// UpdateTask godoc
// @Summary      Update task details (Partial Update / PATCH)
// @Tags         tasks
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id path string true "Task ID"
// @Param        request body dto.UpdateTaskRequest true "Task Update Payload"
// @Success      200 {object} dto.TaskResponse
// @Router       /api/tasks/{id} [patch]
func (h *TaskHandler) UpdateTask(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		response.Error(c, &apperrors.AppError{Code: "UNAUTHORIZED", Message: "Unauthorized context", Err: err})
		return
	}

	taskID := c.Param("id")
	var req dto.UpdateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, &apperrors.AppError{Code: "BAD_REQUEST", Message: "Invalid task update payload", Err: err})
		return
	}

	res, err := h.taskService.UpdateTask(c.Request.Context(), taskID, userID, &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, http.StatusOK, res)
}

// GetDashboardTasks godoc
// @Summary      Get dashboard tasks for current user
// @Tags         dashboard
// @Produce      json
// @Security     BearerAuth
// @Success      200 {object} []dto.TaskResponse
// @Router       /api/dashboard [get]
func (h *TaskHandler) GetDashboardTasks(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		response.Error(c, &apperrors.AppError{Code: "UNAUTHORIZED", Message: "Unauthorized context", Err: err})
		return
	}

	res, err := h.taskService.GetDashboardTasks(c.Request.Context(), userID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, http.StatusOK, res)
}
