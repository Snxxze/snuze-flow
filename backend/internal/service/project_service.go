package service

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"snuze-flow/backend/internal/domain"
	"snuze-flow/backend/internal/dto"
	"snuze-flow/backend/pkg/apperrors"
)

// Consumer defined interfaces in service package per architecture rules
type ProjectRepository interface {
	CreateProject(ctx context.Context, project *domain.Project) error
	GetProjectByID(ctx context.Context, id string) (*domain.Project, error)
	ListProjectsByUserID(ctx context.Context, userID string) ([]domain.Project, error)
	GetProjectMemberRole(ctx context.Context, projectID, userID string) (domain.ProjectRole, error)
	ListProjectMembers(ctx context.Context, projectID string) ([]domain.ProjectMember, error)
	CreateInvitation(ctx context.Context, invitation *domain.ProjectInvitation) error
	ListPendingInvitationsByUserID(ctx context.Context, userID string) ([]domain.ProjectInvitation, error)
	RespondToInvitation(ctx context.Context, invitationID, userID string, accept bool) error
	GetProjectStats(ctx context.Context, projectID string) (*domain.ProjectStats, error)
	UpdateProject(ctx context.Context, id string, name *string, description *string) (*domain.Project, error)
	DeleteProject(ctx context.Context, id string) error
}

type ProjectService struct {
	projectRepo ProjectRepository
	userRepo    UserRepository
}

func NewProjectService(projectRepo ProjectRepository, userRepo UserRepository) *ProjectService {
	return &ProjectService{
		projectRepo: projectRepo,
		userRepo:    userRepo,
	}
}

func (s *ProjectService) CreateProject(ctx context.Context, userID string, req *dto.CreateProjectRequest) (*dto.ProjectResponse, error) {
	project := &domain.Project{
		Name:        strings.TrimSpace(req.Name),
		Description: strings.TrimSpace(req.Description),
		OwnerID:     userID,
	}

	if err := s.projectRepo.CreateProject(ctx, project); err != nil {
		return nil, fmt.Errorf("failed to create project: %w", err)
	}

	return &dto.ProjectResponse{
		ID:          project.ID,
		Name:        project.Name,
		Description: project.Description,
		OwnerID:     project.OwnerID,
		Role:        string(domain.RoleOwner),
		CreatedAt:   project.CreatedAt.Format(time.RFC3339),
	}, nil
}

func (s *ProjectService) ListProjects(ctx context.Context, userID string) ([]dto.ProjectResponse, error) {
	projects, err := s.projectRepo.ListProjectsByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to list projects: %w", err)
	}

	res := make([]dto.ProjectResponse, 0, len(projects))
	for _, p := range projects {
		role, _ := s.projectRepo.GetProjectMemberRole(ctx, p.ID, userID)
		res = append(res, dto.ProjectResponse{
			ID:          p.ID,
			Name:        p.Name,
			Description: p.Description,
			OwnerID:     p.OwnerID,
			Role:        string(role),
			CreatedAt:   p.CreatedAt.Format(time.RFC3339),
		})
	}
	return res, nil
}

func (s *ProjectService) GetProjectDetail(ctx context.Context, projectID, userID string) (*dto.ProjectResponse, error) {
	role, err := s.projectRepo.GetProjectMemberRole(ctx, projectID, userID)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, &apperrors.AppError{
				Code:    "FORBIDDEN",
				Message: "You are not a member of this project",
				Err:     apperrors.ErrForbidden,
			}
		}
		return nil, fmt.Errorf("error checking project membership: %w", err)
	}

	project, err := s.projectRepo.GetProjectByID(ctx, projectID)
	if err != nil {
		return nil, err
	}

	members, err := s.projectRepo.ListProjectMembers(ctx, projectID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch project members: %w", err)
	}

	memberDtos := make([]dto.ProjectMemberResponse, 0, len(members))
	for _, m := range members {
		memberDtos = append(memberDtos, dto.ProjectMemberResponse{
			UserID:      m.UserID,
			Email:       m.Email,
			Username:    m.Username,
			DisplayName: m.DisplayName,
			Role:        string(m.Role),
			JoinedAt:    m.JoinedAt.Format(time.RFC3339),
		})
	}

	return &dto.ProjectResponse{
		ID:          project.ID,
		Name:        project.Name,
		Description: project.Description,
		OwnerID:     project.OwnerID,
		Role:        string(role),
		CreatedAt:   project.CreatedAt.Format(time.RFC3339),
		Members:     memberDtos,
	}, nil
}

func (s *ProjectService) InviteMember(ctx context.Context, projectID, currentUserID string, req *dto.InviteMemberRequest) (*dto.InvitationResponse, error) {
	role, err := s.projectRepo.GetProjectMemberRole(ctx, projectID, currentUserID)
	if err != nil || role != domain.RoleOwner {
		return nil, &apperrors.AppError{
			Code:    "FORBIDDEN",
			Message: "Only project owners can invite new members",
			Err:     apperrors.ErrForbidden,
		}
	}

	cleanEmail := strings.TrimSpace(strings.ToLower(req.Email))
	targetUser, err := s.userRepo.GetByEmail(ctx, cleanEmail)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, &apperrors.AppError{
				Code:    "NOT_FOUND",
				Message: "User with specified email not found",
				Err:     apperrors.ErrNotFound,
			}
		}
		return nil, fmt.Errorf("failed to find user by email: %w", err)
	}

	// Check if already a member
	if existingRole, _ := s.projectRepo.GetProjectMemberRole(ctx, projectID, targetUser.ID); existingRole != "" {
		return nil, &apperrors.AppError{
			Code:    "CONFLICT",
			Message: "User is already a member of this project",
			Err:     apperrors.ErrConflict,
		}
	}

	invitation := &domain.ProjectInvitation{
		ProjectID:     projectID,
		InvitedUserID: targetUser.ID,
		InvitedByID:   currentUserID,
		Status:        domain.InvitationPending,
	}

	if err := s.projectRepo.CreateInvitation(ctx, invitation); err != nil {
		return nil, fmt.Errorf("failed to create invitation: %w", err)
	}

	project, _ := s.projectRepo.GetProjectByID(ctx, projectID)
	projectName := ""
	if project != nil {
		projectName = project.Name
	}

	return &dto.InvitationResponse{
		ID:          invitation.ID,
		ProjectID:   invitation.ProjectID,
		ProjectName: projectName,
		InvitedBy:   currentUserID,
		Status:      string(invitation.Status),
		CreatedAt:   invitation.CreatedAt.Format(time.RFC3339),
	}, nil
}

func (s *ProjectService) ListPendingInvitations(ctx context.Context, userID string) ([]dto.InvitationResponse, error) {
	invitations, err := s.projectRepo.ListPendingInvitationsByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to list invitations: %w", err)
	}

	res := make([]dto.InvitationResponse, 0, len(invitations))
	for _, inv := range invitations {
		res = append(res, dto.InvitationResponse{
			ID:          inv.ID,
			ProjectID:   inv.ProjectID,
			ProjectName: inv.ProjectName,
			InvitedBy:   inv.InvitedBy,
			Status:      string(inv.Status),
			CreatedAt:   inv.CreatedAt.Format(time.RFC3339),
		})
	}
	return res, nil
}

func (s *ProjectService) RespondToInvitation(ctx context.Context, invitationID, userID string, accept bool) error {
	return s.projectRepo.RespondToInvitation(ctx, invitationID, userID, accept)
}

func (s *ProjectService) GetProjectStats(ctx context.Context, projectID, userID string) (*dto.ProjectStatsResponse, error) {
	// Authorization Check: Must be member of project
	if _, err := s.projectRepo.GetProjectMemberRole(ctx, projectID, userID); err != nil {
		return nil, &apperrors.AppError{
			Code:    "FORBIDDEN",
			Message: "You are not a member of this project",
			Err:     apperrors.ErrForbidden,
		}
	}

	stats, err := s.projectRepo.GetProjectStats(ctx, projectID)
	if err != nil {
		return nil, fmt.Errorf("failed to get project stats: %w", err)
	}

	return &dto.ProjectStatsResponse{
		TotalTasks:      stats.TotalTasks,
		TodoTasks:       stats.TodoTasks,
		InProgressTasks: stats.InProgressTasks,
		DoneTasks:       stats.DoneTasks,
		OverdueTasks:    stats.OverdueTasks,
		TotalMembers:    stats.TotalMembers,
		CompletionRate:  stats.CompletionRate,
	}, nil
}

func (s *ProjectService) UpdateProject(ctx context.Context, projectID, userID string, req *dto.UpdateProjectRequest) (*dto.ProjectResponse, error) {
	role, err := s.projectRepo.GetProjectMemberRole(ctx, projectID, userID)
	if err != nil || role != domain.RoleOwner {
		return nil, &apperrors.AppError{
			Code:    "FORBIDDEN",
			Message: "Only project owner can update project details",
			Err:     apperrors.ErrForbidden,
		}
	}

	project, err := s.projectRepo.UpdateProject(ctx, projectID, req.Name, req.Description)
	if err != nil {
		return nil, fmt.Errorf("failed to update project: %w", err)
	}

	return &dto.ProjectResponse{
		ID:          project.ID,
		Name:        project.Name,
		Description: project.Description,
		OwnerID:     project.OwnerID,
		Role:        string(domain.RoleOwner),
		CreatedAt:   project.CreatedAt.Format(time.RFC3339),
	}, nil
}

func (s *ProjectService) DeleteProject(ctx context.Context, projectID, userID string) error {
	role, err := s.projectRepo.GetProjectMemberRole(ctx, projectID, userID)
	if err != nil || role != domain.RoleOwner {
		return &apperrors.AppError{
			Code:    "FORBIDDEN",
			Message: "Only project owner can delete project",
			Err:     apperrors.ErrForbidden,
		}
	}

	return s.projectRepo.DeleteProject(ctx, projectID)
}
