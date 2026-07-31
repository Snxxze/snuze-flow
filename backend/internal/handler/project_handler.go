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

type ProjectHandler struct {
	projectService *service.ProjectService
}

func NewProjectHandler(projectService *service.ProjectService) *ProjectHandler {
	return &ProjectHandler{projectService: projectService}
}

// CreateProject godoc
// @Summary      Create a new project
// @Description  Creates a project where current user becomes the Owner
// @Tags         projects
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request body dto.CreateProjectRequest true "Project Creation Payload"
// @Success      201 {object} dto.ProjectResponse
// @Failure      400 {object} response.ErrorResponse
// @Failure      401 {object} response.ErrorResponse
// @Router       /api/projects [post]
func (h *ProjectHandler) CreateProject(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		response.Error(c, &apperrors.AppError{Code: "UNAUTHORIZED", Message: "Unauthorized context", Err: err})
		return
	}

	var req dto.CreateProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, &apperrors.AppError{Code: "BAD_REQUEST", Message: "Invalid project payload", Err: err})
		return
	}

	res, err := h.projectService.CreateProject(c.Request.Context(), userID, &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, http.StatusCreated, res)
}

// ListProjects godoc
// @Summary      List user projects
// @Description  Returns all projects where current user is a member
// @Tags         projects
// @Produce      json
// @Security     BearerAuth
// @Success      200 {object} []dto.ProjectResponse
// @Failure      401 {object} response.ErrorResponse
// @Router       /api/projects [get]
func (h *ProjectHandler) ListProjects(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		response.Error(c, &apperrors.AppError{Code: "UNAUTHORIZED", Message: "Unauthorized context", Err: err})
		return
	}

	res, err := h.projectService.ListProjects(c.Request.Context(), userID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, http.StatusOK, res)
}

// GetProjectDetail godoc
// @Summary      Get project detail
// @Description  Returns project details and member list if user is a member
// @Tags         projects
// @Produce      json
// @Security     BearerAuth
// @Param        id path string true "Project ID"
// @Success      200 {object} dto.ProjectResponse
// @Failure      401 {object} response.ErrorResponse
// @Failure      403 {object} response.ErrorResponse
// @Failure      404 {object} response.ErrorResponse
// @Router       /api/projects/{id} [get]
func (h *ProjectHandler) GetProjectDetail(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		response.Error(c, &apperrors.AppError{Code: "UNAUTHORIZED", Message: "Unauthorized context", Err: err})
		return
	}

	projectID := c.Param("id")
	if projectID == "" {
		response.Error(c, &apperrors.AppError{Code: "BAD_REQUEST", Message: "Project ID is required", Err: nil})
		return
	}

	res, err := h.projectService.GetProjectDetail(c.Request.Context(), projectID, userID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, http.StatusOK, res)
}

// InviteMember godoc
// @Summary      Invite member to project
// @Description  Sends an invitation to a user by email (Owner only)
// @Tags         projects
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id path string true "Project ID"
// @Param        request body dto.InviteMemberRequest true "Invite Member Payload"
// @Success      201 {object} dto.InvitationResponse
// @Failure      400 {object} response.ErrorResponse
// @Failure      403 {object} response.ErrorResponse
// @Router       /api/projects/{id}/invitations [post]
func (h *ProjectHandler) InviteMember(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		response.Error(c, &apperrors.AppError{Code: "UNAUTHORIZED", Message: "Unauthorized context", Err: err})
		return
	}

	projectID := c.Param("id")
	var req dto.InviteMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, &apperrors.AppError{Code: "BAD_REQUEST", Message: "Invalid invitation payload", Err: err})
		return
	}

	res, err := h.projectService.InviteMember(c.Request.Context(), projectID, userID, &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, http.StatusCreated, res)
}

// ListPendingInvitations godoc
// @Summary      List pending invitations for user
// @Tags         invitations
// @Produce      json
// @Security     BearerAuth
// @Success      200 {object} []dto.InvitationResponse
// @Router       /api/invitations [get]
func (h *ProjectHandler) ListPendingInvitations(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		response.Error(c, &apperrors.AppError{Code: "UNAUTHORIZED", Message: "Unauthorized context", Err: err})
		return
	}

	res, err := h.projectService.ListPendingInvitations(c.Request.Context(), userID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, http.StatusOK, res)
}

// AcceptInvitation godoc
// @Summary      Accept project invitation
// @Tags         invitations
// @Security     BearerAuth
// @Param        id path string true "Invitation ID"
// @Success      200 {object} map[string]string
// @Router       /api/invitations/{id}/accept [post]
func (h *ProjectHandler) AcceptInvitation(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		response.Error(c, &apperrors.AppError{Code: "UNAUTHORIZED", Message: "Unauthorized context", Err: err})
		return
	}

	invitationID := c.Param("id")
	if err := h.projectService.RespondToInvitation(c.Request.Context(), invitationID, userID, true); err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, http.StatusOK, gin.H{"message": "Invitation accepted successfully"})
}

// RejectInvitation godoc
// @Summary      Reject project invitation
// @Tags         invitations
// @Security     BearerAuth
// @Param        id path string true "Invitation ID"
// @Success      200 {object} map[string]string
// @Router       /api/invitations/{id}/reject [post]
func (h *ProjectHandler) RejectInvitation(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		response.Error(c, &apperrors.AppError{Code: "UNAUTHORIZED", Message: "Unauthorized context", Err: err})
		return
	}

	invitationID := c.Param("id")
	if err := h.projectService.RespondToInvitation(c.Request.Context(), invitationID, userID, false); err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, http.StatusOK, gin.H{"message": "Invitation rejected successfully"})
}

// GetProjectStats godoc
// @Summary      Get project task analytics & stats
// @Tags         projects
// @Produce      json
// @Security     BearerAuth
// @Param        id path string true "Project ID"
// @Success      200 {object} dto.ProjectStatsResponse
// @Router       /api/projects/{id}/stats [get]
func (h *ProjectHandler) GetProjectStats(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		response.Error(c, &apperrors.AppError{Code: "UNAUTHORIZED", Message: "Unauthorized context", Err: err})
		return
	}

	projectID := c.Param("id")
	res, err := h.projectService.GetProjectStats(c.Request.Context(), projectID, userID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, http.StatusOK, res)
}

// RespondInvitation godoc
// @Summary      Respond to project invitation (accept/reject)
// @Tags         invitations
// @Security     BearerAuth
// @Param        id path string true "Invitation ID"
// @Param        request body dto.RespondInvitationRequest true "Response Payload"
// @Success      200 {object} map[string]string
// @Router       /api/invitations/{id}/respond [put]
func (h *ProjectHandler) RespondInvitation(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		response.Error(c, &apperrors.AppError{Code: "UNAUTHORIZED", Message: "Unauthorized context", Err: err})
		return
	}

	invitationID := c.Param("id")
	var req dto.RespondInvitationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, &apperrors.AppError{Code: "BAD_REQUEST", Message: "Invalid invitation response payload", Err: err})
		return
	}

	accept := req.Status == "accepted"
	if err := h.projectService.RespondToInvitation(c.Request.Context(), invitationID, userID, accept); err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, http.StatusOK, gin.H{"message": "Invitation status updated successfully"})
}

// UpdateProject godoc
// @Summary      Update project details (Owner only)
// @Tags         projects
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id path string true "Project ID"
// @Param        request body dto.UpdateProjectRequest true "Update Payload"
// @Success      200 {object} dto.ProjectResponse
// @Router       /api/projects/{id} [patch]
func (h *ProjectHandler) UpdateProject(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		response.Error(c, &apperrors.AppError{Code: "UNAUTHORIZED", Message: "Unauthorized context", Err: err})
		return
	}

	projectID := c.Param("id")
	var req dto.UpdateProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, &apperrors.AppError{Code: "BAD_REQUEST", Message: "Invalid project update payload", Err: err})
		return
	}

	res, err := h.projectService.UpdateProject(c.Request.Context(), projectID, userID, &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, http.StatusOK, res)
}

// DeleteProject godoc
// @Summary      Delete project (Owner only)
// @Tags         projects
// @Security     BearerAuth
// @Param        id path string true "Project ID"
// @Success      200 {object} map[string]string
// @Router       /api/projects/{id} [delete]
func (h *ProjectHandler) DeleteProject(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		response.Error(c, &apperrors.AppError{Code: "UNAUTHORIZED", Message: "Unauthorized context", Err: err})
		return
	}

	projectID := c.Param("id")
	if err := h.projectService.DeleteProject(c.Request.Context(), projectID, userID); err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, http.StatusOK, gin.H{"message": "Project deleted successfully"})
}
