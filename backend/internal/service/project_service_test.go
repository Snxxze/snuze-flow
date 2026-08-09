package service_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"snuze-flow/backend/internal/domain"
	"snuze-flow/backend/internal/dto"
	"snuze-flow/backend/internal/service"
	"snuze-flow/backend/pkg/apperrors"
)

// mockProjectRepository implements service.ProjectRepository
type mockProjectRepository struct {
	projects    map[string]*domain.Project
	members     map[string]domain.ProjectRole // key: "projID:userID"
	invitations map[string]*domain.ProjectInvitation
}

func newMockProjectRepository() *mockProjectRepository {
	return &mockProjectRepository{
		projects:    make(map[string]*domain.Project),
		members:     make(map[string]domain.ProjectRole),
		invitations: make(map[string]*domain.ProjectInvitation),
	}
}

func (m *mockProjectRepository) CreateProject(ctx context.Context, project *domain.Project) error {
	if project.ID == "" {
		project.ID = "proj-uuid-1"
	}
	project.CreatedAt = time.Now()
	m.projects[project.ID] = project
	m.members[project.ID+":"+project.OwnerID] = domain.RoleOwner
	return nil
}

func (m *mockProjectRepository) GetProjectByID(ctx context.Context, id string) (*domain.Project, error) {
	p, exists := m.projects[id]
	if !exists {
		return nil, apperrors.ErrNotFound
	}
	return p, nil
}

func (m *mockProjectRepository) ListProjectsByUserID(ctx context.Context, userID string) ([]domain.Project, error) {
	var res []domain.Project
	for key, role := range m.members {
		if role != "" {
			// key is projID:userID
			var pID, uID string
			n, _ := fmtSscanf(key, "%s:%s", &pID, &uID)
			if n == 2 && uID == userID {
				if p, exists := m.projects[pID]; exists {
					res = append(res, *p)
				}
			}
		}
	}
	return res, nil
}

func fmtSscanf(str, format string, pID, uID *string) (int, error) {
	idx := 0
	for i, c := range str {
		if c == ':' {
			idx = i
			break
		}
	}
	if idx > 0 {
		*pID = str[:idx]
		*uID = str[idx+1:]
		return 2, nil
	}
	return 0, errors.New("invalid format")
}

func (m *mockProjectRepository) GetProjectMemberRole(ctx context.Context, projectID, userID string) (domain.ProjectRole, error) {
	role, exists := m.members[projectID+":"+userID]
	if !exists {
		return "", apperrors.ErrNotFound
	}
	return role, nil
}

func (m *mockProjectRepository) ListProjectMembers(ctx context.Context, projectID string) ([]domain.ProjectMember, error) {
	var res []domain.ProjectMember
	for key, role := range m.members {
		var pID, uID string
		fmtSscanf(key, "%s:%s", &pID, &uID)
		if pID == projectID {
			res = append(res, domain.ProjectMember{
				ProjectID: pID,
				UserID:    uID,
				Role:      role,
			})
		}
	}
	return res, nil
}

func (m *mockProjectRepository) CreateInvitation(ctx context.Context, invitation *domain.ProjectInvitation) error {
	if invitation.ID == "" {
		invitation.ID = "inv-123"
	}
	invitation.CreatedAt = time.Now()
	m.invitations[invitation.ID] = invitation
	return nil
}

func (m *mockProjectRepository) ListPendingInvitationsByUserID(ctx context.Context, userID string) ([]domain.ProjectInvitation, error) {
	var res []domain.ProjectInvitation
	for _, inv := range m.invitations {
		if inv.InvitedUserID == userID && inv.Status == domain.InvitationPending {
			res = append(res, *inv)
		}
	}
	return res, nil
}

func (m *mockProjectRepository) RespondToInvitation(ctx context.Context, invitationID, userID string, accept bool) error {
	inv, exists := m.invitations[invitationID]
	if !exists {
		return apperrors.ErrNotFound
	}
	if accept {
		inv.Status = domain.InvitationAccepted
		m.members[inv.ProjectID+":"+userID] = domain.RoleMember
	} else {
		inv.Status = domain.InvitationRejected
	}
	return nil
}

func (m *mockProjectRepository) GetProjectStats(ctx context.Context, projectID string) (*domain.ProjectStats, error) {
	return &domain.ProjectStats{
		TotalTasks:      10,
		DoneTasks:       6,
		CompletionRate:  60,
		TodoTasks:       2,
		InProgressTasks: 2,
		OverdueTasks:    1,
		TotalMembers:    3,
	}, nil
}

func (m *mockProjectRepository) UpdateProject(ctx context.Context, id string, name, description *string) (*domain.Project, error) {
	p, exists := m.projects[id]
	if !exists {
		return nil, apperrors.ErrNotFound
	}
	if name != nil {
		p.Name = *name
	}
	return p, nil
}

func (m *mockProjectRepository) DeleteProject(ctx context.Context, id string) error {
	delete(m.projects, id)
	return nil
}

func TestProjectService_DeleteProject_OwnerSuccess(t *testing.T) {
	repo := newMockProjectRepository()
	userRepo := newMockUserRepository()
	svc := service.NewProjectService(repo, userRepo)

	projID := "proj-1"
	ownerID := "owner-user-1"
	repo.projects[projID] = &domain.Project{ID: projID, Name: "Test Proj", OwnerID: ownerID}
	repo.members[projID+":"+ownerID] = domain.RoleOwner

	err := svc.DeleteProject(context.Background(), projID, ownerID)
	if err != nil {
		t.Fatalf("expected owner to be able to delete project, got: %v", err)
	}
}

func TestProjectService_DeleteProject_MemberForbidden(t *testing.T) {
	repo := newMockProjectRepository()
	userRepo := newMockUserRepository()
	svc := service.NewProjectService(repo, userRepo)

	projID := "proj-1"
	ownerID := "owner-user-1"
	memberID := "member-user-2"
	repo.projects[projID] = &domain.Project{ID: projID, Name: "Test Proj", OwnerID: ownerID}
	repo.members[projID+":"+ownerID] = domain.RoleOwner
	repo.members[projID+":"+memberID] = domain.RoleMember

	// Member attempts to delete project -> MUST FAIL WITH 403 FORBIDDEN
	err := svc.DeleteProject(context.Background(), projID, memberID)
	if err == nil {
		t.Fatalf("expected member deletion to fail with FORBIDDEN, got nil")
	}

	var appErr *apperrors.AppError
	if !errors.As(err, &appErr) || appErr.Code != "FORBIDDEN" {
		t.Errorf("expected AppError FORBIDDEN for member, got %v", err)
	}
}

func TestProjectService_InviteMember_OnlyOwnerAllowed(t *testing.T) {
	repo := newMockProjectRepository()
	userRepo := newMockUserRepository()
	svc := service.NewProjectService(repo, userRepo)

	projID := "proj-1"
	ownerID := "owner-1"
	memberID := "member-2"
	repo.projects[projID] = &domain.Project{ID: projID, Name: "Test Proj", OwnerID: ownerID}
	repo.members[projID+":"+ownerID] = domain.RoleOwner
	repo.members[projID+":"+memberID] = domain.RoleMember

	req := &dto.InviteMemberRequest{Email: "target@example.com"}

	// Member attempts to invite -> MUST FAIL WITH FORBIDDEN
	_, err := svc.InviteMember(context.Background(), projID, memberID, req)
	if err == nil {
		t.Fatalf("expected invite by member to be FORBIDDEN, got nil")
	}

	var appErr *apperrors.AppError
	if !errors.As(err, &appErr) || appErr.Code != "FORBIDDEN" {
		t.Errorf("expected FORBIDDEN, got %v", err)
	}
}
