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

// Consumer defined interface in service package per architecture rules
type SubtaskRepository interface {
	CreateSubtask(ctx context.Context, subtask *domain.Subtask) error
	ListSubtasksByTaskID(ctx context.Context, taskID string) ([]domain.Subtask, error)
	GetSubtaskByID(ctx context.Context, id string) (*domain.Subtask, error)
	UpdateSubtaskStatus(ctx context.Context, id string, isCompleted bool) error
	DeleteSubtask(ctx context.Context, id string) error
}

type SubtaskService struct {
	subtaskRepo SubtaskRepository
	taskRepo    TaskRepository
	projectRepo ProjectRepository
}

func NewSubtaskService(subtaskRepo SubtaskRepository, taskRepo TaskRepository, projectRepo ProjectRepository) *SubtaskService {
	return &SubtaskService{
		subtaskRepo: subtaskRepo,
		taskRepo:    taskRepo,
		projectRepo: projectRepo,
	}
}

func (s *SubtaskService) CreateSubtask(ctx context.Context, taskID, userID string, req *dto.CreateSubtaskRequest) (*dto.SubtaskResponse, error) {
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

	subtask := &domain.Subtask{
		TaskID:      taskID,
		Title:       strings.TrimSpace(req.Title),
		IsCompleted: false,
	}

	if err := s.subtaskRepo.CreateSubtask(ctx, subtask); err != nil {
		return nil, fmt.Errorf("failed to create subtask: %w", err)
	}

	return &dto.SubtaskResponse{
		ID:          subtask.ID,
		TaskID:      subtask.TaskID,
		Title:       subtask.Title,
		IsCompleted: subtask.IsCompleted,
		CreatedAt:   subtask.CreatedAt.Format(time.RFC3339),
	}, nil
}

func (s *SubtaskService) ListSubtasks(ctx context.Context, taskID, userID string) ([]dto.SubtaskResponse, error) {
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

	subtasks, err := s.subtaskRepo.ListSubtasksByTaskID(ctx, taskID)
	if err != nil {
		return nil, fmt.Errorf("failed to list subtasks: %w", err)
	}

	res := make([]dto.SubtaskResponse, 0, len(subtasks))
	for _, sub := range subtasks {
		res = append(res, dto.SubtaskResponse{
			ID:          sub.ID,
			TaskID:      sub.TaskID,
			Title:       sub.Title,
			IsCompleted: sub.IsCompleted,
			CreatedAt:   sub.CreatedAt.Format(time.RFC3339),
		})
	}
	return res, nil
}

func (s *SubtaskService) ToggleSubtaskStatus(ctx context.Context, subtaskID, userID string, req *dto.UpdateSubtaskStatusRequest) error {
	subtask, err := s.subtaskRepo.GetSubtaskByID(ctx, subtaskID)
	if err != nil {
		return err
	}

	task, err := s.taskRepo.GetTaskByID(ctx, subtask.TaskID)
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

	return s.subtaskRepo.UpdateSubtaskStatus(ctx, subtaskID, req.IsCompleted)
}

func (s *SubtaskService) DeleteSubtask(ctx context.Context, subtaskID, userID string) error {
	subtask, err := s.subtaskRepo.GetSubtaskByID(ctx, subtaskID)
	if err != nil {
		return err
	}

	task, err := s.taskRepo.GetTaskByID(ctx, subtask.TaskID)
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

	return s.subtaskRepo.DeleteSubtask(ctx, subtaskID)
}
