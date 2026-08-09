package service

import (
	"context"
	"fmt"
	"strings"
	"time"

	"snuze-flow/backend/internal/domain"
	"snuze-flow/backend/internal/dto"
	"snuze-flow/backend/pkg/apperrors"
)

// Consumer defined interfaces in service package per architecture rules
type TaskRepository interface {
	CreateTask(ctx context.Context, task *domain.Task) error
	ListTasksByProjectID(ctx context.Context, projectID string) ([]domain.Task, error)
	GetTaskByID(ctx context.Context, id string) (*domain.Task, error)
	UpdateTaskStatus(ctx context.Context, id string, status domain.TaskStatus) error
	DeleteTask(ctx context.Context, id string) error
	UpdateTask(ctx context.Context, id string, title *string, description *string, priority *string, status *string, dueDate *time.Time, assigneeID *string) (*domain.Task, error)
	ListDashboardTasksByUserID(ctx context.Context, userID string) ([]domain.Task, error)
}

type TaskService struct {
	taskRepo    TaskRepository
	projectRepo ProjectRepository
	userRepo    UserRepository
}

func NewTaskService(taskRepo TaskRepository, projectRepo ProjectRepository, userRepo UserRepository) *TaskService {
	return &TaskService{
		taskRepo:    taskRepo,
		projectRepo: projectRepo,
		userRepo:    userRepo,
	}
}

func (s *TaskService) CreateTask(ctx context.Context, projectID, userID string, req *dto.CreateTaskRequest) (*dto.TaskResponse, error) {
	// Authorization Check: Must be member of project
	if _, err := s.projectRepo.GetProjectMemberRole(ctx, projectID, userID); err != nil {
		return nil, &apperrors.AppError{
			Code:    "FORBIDDEN",
			Message: "You are not a member of this project",
			Err:     apperrors.ErrForbidden,
		}
	}

	task := &domain.Task{
		ProjectID:   projectID,
		Title:       strings.TrimSpace(req.Title),
		Description: strings.TrimSpace(req.Description),
		Status:      domain.TaskStatusTodo,
		Priority:    domain.TaskPriority(req.Priority),
		AssigneeID:  req.AssigneeID,
	}

	if req.AssigneeID != nil && *req.AssigneeID != "" {
		if user, err := s.userRepo.GetByID(ctx, *req.AssigneeID); err == nil && user != nil {
			task.AssigneeEmail = user.Email
			task.AssigneeUsername = user.Username
			task.AssigneeDisplayName = user.DisplayName
		}
	}

	if req.DueDate != nil && *req.DueDate != "" {
		parsedTime, err := time.Parse(time.RFC3339, *req.DueDate)
		if err == nil {
			task.DueDate = &parsedTime
		}
	}

	if err := s.taskRepo.CreateTask(ctx, task); err != nil {
		return nil, fmt.Errorf("failed to create task: %w", err)
	}

	return s.mapTaskToResponse(task), nil
}

func (s *TaskService) ListTasks(ctx context.Context, projectID, userID string) ([]dto.TaskResponse, error) {
	// Authorization Check: Must be member of project
	if _, err := s.projectRepo.GetProjectMemberRole(ctx, projectID, userID); err != nil {
		return nil, &apperrors.AppError{
			Code:    "FORBIDDEN",
			Message: "You are not a member of this project",
			Err:     apperrors.ErrForbidden,
		}
	}

	tasks, err := s.taskRepo.ListTasksByProjectID(ctx, projectID)
	if err != nil {
		return nil, fmt.Errorf("failed to list tasks: %w", err)
	}

	res := make([]dto.TaskResponse, 0, len(tasks))
	for _, t := range tasks {
		res = append(res, *s.mapTaskToResponse(&t))
	}
	return res, nil
}

func (s *TaskService) UpdateTaskStatus(ctx context.Context, taskID, userID string, req *dto.UpdateTaskStatusRequest) error {
	task, err := s.taskRepo.GetTaskByID(ctx, taskID)
	if err != nil {
		return err
	}

	// Authorization Check: Must be member of task's project
	if _, err := s.projectRepo.GetProjectMemberRole(ctx, task.ProjectID, userID); err != nil {
		return &apperrors.AppError{
			Code:    "FORBIDDEN",
			Message: "You are not a member of this project",
			Err:     apperrors.ErrForbidden,
		}
	}

	return s.taskRepo.UpdateTaskStatus(ctx, taskID, domain.TaskStatus(req.Status))
}

func (s *TaskService) DeleteTask(ctx context.Context, taskID, userID string) error {
	task, err := s.taskRepo.GetTaskByID(ctx, taskID)
	if err != nil {
		return err
	}

	// Authorization Check: Must be member of task's project
	if _, err := s.projectRepo.GetProjectMemberRole(ctx, task.ProjectID, userID); err != nil {
		return &apperrors.AppError{
			Code:    "FORBIDDEN",
			Message: "You are not a member of this project",
			Err:     apperrors.ErrForbidden,
		}
	}

	return s.taskRepo.DeleteTask(ctx, taskID)
}

func (s *TaskService) UpdateTask(ctx context.Context, taskID, userID string, req *dto.UpdateTaskRequest) (*dto.TaskResponse, error) {
	task, err := s.taskRepo.GetTaskByID(ctx, taskID)
	if err != nil {
		return nil, err
	}

	// Authorization Check: Must be member of task's project
	if _, err := s.projectRepo.GetProjectMemberRole(ctx, task.ProjectID, userID); err != nil {
		return nil, &apperrors.AppError{
			Code:    "FORBIDDEN",
			Message: "You are not a member of this project",
			Err:     apperrors.ErrForbidden,
		}
	}

	var parsedDueDate *time.Time
	if req.DueDate != nil && *req.DueDate != "" {
		t, err := time.Parse(time.RFC3339, *req.DueDate)
		if err == nil {
			parsedDueDate = &t
		}
	}

	updatedTask, err := s.taskRepo.UpdateTask(ctx, taskID, req.Title, req.Description, req.Priority, req.Status, parsedDueDate, req.AssigneeID)
	if err != nil {
		return nil, fmt.Errorf("failed to update task: %w", err)
	}

	return s.mapTaskToResponse(updatedTask), nil
}

func (s *TaskService) GetDashboardTasks(ctx context.Context, userID string) ([]dto.TaskResponse, error) {
	tasks, err := s.taskRepo.ListDashboardTasksByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to list dashboard tasks: %w", err)
	}

	res := make([]dto.TaskResponse, 0, len(tasks))
	for _, t := range tasks {
		res = append(res, *s.mapTaskToResponse(&t))
	}
	return res, nil
}

func (s *TaskService) mapTaskToResponse(t *domain.Task) *dto.TaskResponse {
	res := &dto.TaskResponse{
		ID:          t.ID,
		ProjectID:   t.ProjectID,
		Title:       t.Title,
		Description: t.Description,
		Status:      string(t.Status),
		Priority:    string(t.Priority),
		CreatedAt:   t.CreatedAt.Format(time.RFC3339),
	}

	if t.DueDate != nil {
		formatted := t.DueDate.Format(time.RFC3339)
		res.DueDate = &formatted
	}

	if t.AssigneeID != nil && *t.AssigneeID != "" {
		res.Assignee = &dto.TaskAssigneeResponse{
			ID:          *t.AssigneeID,
			Email:       t.AssigneeEmail,
			Username:    t.AssigneeUsername,
			DisplayName: t.AssigneeDisplayName,
		}
	}

	return res
}
