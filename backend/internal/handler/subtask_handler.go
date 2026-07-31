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

type SubtaskHandler struct {
	subtaskService *service.SubtaskService
}

func NewSubtaskHandler(subtaskService *service.SubtaskService) *SubtaskHandler {
	return &SubtaskHandler{subtaskService: subtaskService}
}

// CreateSubtask godoc
// @Summary      Create subtask for a task
// @Tags         subtasks
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id path string true "Task ID"
// @Param        request body dto.CreateSubtaskRequest true "Subtask Payload"
// @Success      201 {object} dto.SubtaskResponse
// @Router       /api/tasks/{id}/subtasks [post]
func (h *SubtaskHandler) CreateSubtask(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		response.Error(c, &apperrors.AppError{Code: "UNAUTHORIZED", Message: "Unauthorized context", Err: err})
		return
	}

	taskID := c.Param("id")
	var req dto.CreateSubtaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, &apperrors.AppError{Code: "BAD_REQUEST", Message: "Invalid subtask payload", Err: err})
		return
	}

	res, err := h.subtaskService.CreateSubtask(c.Request.Context(), taskID, userID, &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, http.StatusCreated, res)
}

// ListSubtasks godoc
// @Summary      List subtasks of a task
// @Tags         subtasks
// @Produce      json
// @Security     BearerAuth
// @Param        id path string true "Task ID"
// @Success      200 {object} []dto.SubtaskResponse
// @Router       /api/tasks/{id}/subtasks [get]
func (h *SubtaskHandler) ListSubtasks(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		response.Error(c, &apperrors.AppError{Code: "UNAUTHORIZED", Message: "Unauthorized context", Err: err})
		return
	}

	taskID := c.Param("id")
	res, err := h.subtaskService.ListSubtasks(c.Request.Context(), taskID, userID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, http.StatusOK, res)
}

// ToggleSubtaskStatus godoc
// @Summary      Toggle subtask completion status
// @Tags         subtasks
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id path string true "Subtask ID"
// @Param        request body dto.UpdateSubtaskStatusRequest true "Subtask Status Payload"
// @Success      200 {object} map[string]string
// @Router       /api/subtasks/{id}/status [patch]
func (h *SubtaskHandler) ToggleSubtaskStatus(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		response.Error(c, &apperrors.AppError{Code: "UNAUTHORIZED", Message: "Unauthorized context", Err: err})
		return
	}

	subtaskID := c.Param("id")
	var req dto.UpdateSubtaskStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, &apperrors.AppError{Code: "BAD_REQUEST", Message: "Invalid subtask status payload", Err: err})
		return
	}

	if err := h.subtaskService.ToggleSubtaskStatus(c.Request.Context(), subtaskID, userID, &req); err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, http.StatusOK, gin.H{"message": "Subtask status updated successfully"})
}

// DeleteSubtask godoc
// @Summary      Delete subtask
// @Tags         subtasks
// @Security     BearerAuth
// @Param        id path string true "Subtask ID"
// @Success      200 {object} map[string]string
// @Router       /api/subtasks/{id} [delete]
func (h *SubtaskHandler) DeleteSubtask(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		response.Error(c, &apperrors.AppError{Code: "UNAUTHORIZED", Message: "Unauthorized context", Err: err})
		return
	}

	subtaskID := c.Param("id")
	if err := h.subtaskService.DeleteSubtask(c.Request.Context(), subtaskID, userID); err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, http.StatusOK, gin.H{"message": "Subtask deleted successfully"})
}
