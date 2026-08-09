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

// mockTaskRepository implements service.TaskRepository
type mockTaskRepository struct {
	tasks map[string]*domain.Task
}

func newMockTaskRepository() *mockTaskRepository {
	return &mockTaskRepository{
		tasks: make(map[string]*domain.Task),
	}
}

func (m *mockTaskRepository) CreateTask(ctx context.Context, task *domain.Task) error {
	if task.ID == "" {
		task.ID = "task-uuid-123"
	}
	task.CreatedAt = time.Now()
	m.tasks[task.ID] = task
	return nil
}

func (m *mockTaskRepository) ListTasksByProjectID(ctx context.Context, projectID string) ([]domain.Task, error) {
	var res []domain.Task
	for _, t := range m.tasks {
		if t.ProjectID == projectID {
			res = append(res, *t)
		}
	}
	return res, nil
}

func (m *mockTaskRepository) GetTaskByID(ctx context.Context, id string) (*domain.Task, error) {
	t, exists := m.tasks[id]
	if !exists {
		return nil, apperrors.ErrNotFound
	}
	return t, nil
}

func (m *mockTaskRepository) UpdateTaskStatus(ctx context.Context, id string, status domain.TaskStatus) error {
	t, exists := m.tasks[id]
	if !exists {
		return apperrors.ErrNotFound
	}
	t.Status = status
	return nil
}

func (m *mockTaskRepository) DeleteTask(ctx context.Context, id string) error {
	if _, exists := m.tasks[id]; !exists {
		return apperrors.ErrNotFound
	}
	delete(m.tasks, id)
	return nil
}

func (m *mockTaskRepository) UpdateTask(ctx context.Context, id string, title *string, description *string, priority *string, status *string, dueDate *time.Time, assigneeID *string) (*domain.Task, error) {
	t, exists := m.tasks[id]
	if !exists {
		return nil, apperrors.ErrNotFound
	}
	if title != nil {
		t.Title = *title
	}
	if status != nil {
		t.Status = domain.TaskStatus(*status)
	}
	return t, nil
}

func (m *mockTaskRepository) ListDashboardTasksByUserID(ctx context.Context, userID string) ([]domain.Task, error) {
	var res []domain.Task
	for _, t := range m.tasks {
		res = append(res, *t)
	}
	return res, nil
}

// mockProjectRepositoryForTask implements service.ProjectRepository
type mockProjectRepositoryForTask struct {
	memberRoles map[string]string // key: "projID:userID", val: role ("owner" / "member")
}

func newMockProjectRepositoryForTask() *mockProjectRepositoryForTask {
	return &mockProjectRepositoryForTask{
		memberRoles: make(map[string]string),
	}
}

func (m *mockProjectRepositoryForTask) CreateProject(ctx context.Context, project *domain.Project) error { return nil }
func (m *mockProjectRepositoryForTask) GetProjectByID(ctx context.Context, id string) (*domain.Project, error) { return nil, nil }
func (m *mockProjectRepositoryForTask) ListProjectsByUserID(ctx context.Context, userID string) ([]domain.Project, error) { return nil, nil }
func (m *mockProjectRepositoryForTask) ListProjectMembers(ctx context.Context, projectID string) ([]domain.ProjectMember, error) { return nil, nil }
func (m *mockProjectRepositoryForTask) CreateInvitation(ctx context.Context, inv *domain.ProjectInvitation) error { return nil }
func (m *mockProjectRepositoryForTask) ListPendingInvitationsByUserID(ctx context.Context, userID string) ([]domain.ProjectInvitation, error) { return nil, nil }
func (m *mockProjectRepositoryForTask) RespondToInvitation(ctx context.Context, invitationID, userID string, accept bool) error { return nil }
func (m *mockProjectRepositoryForTask) GetProjectStats(ctx context.Context, projectID string) (*domain.ProjectStats, error) { return nil, nil }
func (m *mockProjectRepositoryForTask) UpdateProject(ctx context.Context, id string, name, description *string) (*domain.Project, error) { return nil, nil }
func (m *mockProjectRepositoryForTask) DeleteProject(ctx context.Context, id string) error { return nil }

func (m *mockProjectRepositoryForTask) GetProjectMemberRole(ctx context.Context, projectID, userID string) (domain.ProjectRole, error) {
	key := projectID + ":" + userID
	role, exists := m.memberRoles[key]
	if !exists {
		return "", apperrors.ErrForbidden
	}
	return domain.ProjectRole(role), nil
}

// Deadline classification logic helper test
func CalculateDeadlineStatus(dueDate *time.Time, now time.Time) string {
	if dueDate == nil {
		return "none"
	}
	diff := dueDate.Sub(now)
	if diff < 0 {
		return "overdue"
	}
	if diff <= 3*24*time.Hour {
		return "approaching"
	}
	return "normal"
}

func TestTaskService_CreateTask_Success(t *testing.T) {
	taskRepo := newMockTaskRepository()
	projRepo := newMockProjectRepositoryForTask()
	userRepo := newMockUserRepository()
	svc := service.NewTaskService(taskRepo, projRepo, userRepo)

	projID := "proj-1"
	userID := "user-1"
	projRepo.memberRoles[projID+":"+userID] = "owner"

	dueDateStr := time.Now().Add(48 * time.Hour).Format(time.RFC3339)
	req := &dto.CreateTaskRequest{
		Title:       "Design System Setup",
		Description: "Setup Tailwind v4 tokens",
		Priority:    "high",
		DueDate:     &dueDateStr,
	}

	resp, err := svc.CreateTask(context.Background(), projID, userID, req)
	if err != nil {
		t.Fatalf("expected successful task creation, got: %v", err)
	}

	if resp.Title != "Design System Setup" {
		t.Errorf("expected title 'Design System Setup', got '%s'", resp.Title)
	}

	if resp.Status != "todo" {
		t.Errorf("expected default status 'todo', got '%s'", resp.Status)
	}
}

func TestTaskService_CreateTask_NonMemberForbidden(t *testing.T) {
	taskRepo := newMockTaskRepository()
	projRepo := newMockProjectRepositoryForTask()
	userRepo := newMockUserRepository()
	svc := service.NewTaskService(taskRepo, projRepo, userRepo)

	req := &dto.CreateTaskRequest{
		Title:    "Unauthorized Task",
		Priority: "low",
	}

	// User is NOT a member of proj-999
	_, err := svc.CreateTask(context.Background(), "proj-999", "stranger-id", req)
	if err == nil {
		t.Fatalf("expected forbidden error for non-member, got nil")
	}

	var appErr *apperrors.AppError
	if !errors.As(err, &appErr) || appErr.Code != "FORBIDDEN" {
		t.Errorf("expected FORBIDDEN error, got %v", err)
	}
}

func TestDeadlineCalculation_Unit(t *testing.T) {
	now := time.Date(2026, 8, 10, 12, 0, 0, 0, time.UTC)

	tests := []struct {
		name     string
		dueDate  *time.Time
		expected string
	}{
		{
			name:     "No due date",
			dueDate:  nil,
			expected: "none",
		},
		{
			name:     "Past due date -> overdue",
			dueDate:  func() *time.Time { t := now.Add(-24 * time.Hour); return &t }(),
			expected: "overdue",
		},
		{
			name:     "Due in 2 days -> approaching",
			dueDate:  func() *time.Time { t := now.Add(48 * time.Hour); return &t }(),
			expected: "approaching",
		},
		{
			name:     "Due in 5 days -> normal",
			dueDate:  func() *time.Time { t := now.Add(120 * time.Hour); return &t }(),
			expected: "normal",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := CalculateDeadlineStatus(tt.dueDate, now)
			if result != tt.expected {
				t.Errorf("expected '%s', got '%s'", tt.expected, result)
			}
		})
	}
}
