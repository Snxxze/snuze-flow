package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"snuze-flow/backend/internal/domain"
	"snuze-flow/backend/pkg/apperrors"
)

type SubtaskDB struct {
	ID          string    `db:"id"`
	TaskID      string    `db:"task_id"`
	Title       string    `db:"title"`
	IsCompleted bool      `db:"is_completed"`
	CreatedAt   time.Time `db:"created_at"`
}

func (s *SubtaskDB) ToDomain() *domain.Subtask {
	return &domain.Subtask{
		ID:          s.ID,
		TaskID:      s.TaskID,
		Title:       s.Title,
		IsCompleted: s.IsCompleted,
		CreatedAt:   s.CreatedAt,
	}
}

type SubtaskRepository struct {
	db *sql.DB
}

func NewSubtaskRepository(db *sql.DB) *SubtaskRepository {
	return &SubtaskRepository{db: db}
}

func (r *SubtaskRepository) CreateSubtask(ctx context.Context, subtask *domain.Subtask) error {
	query := `
		INSERT INTO subtasks (task_id, title, is_completed)
		VALUES ($1, $2, $3)
		RETURNING id, created_at
	`
	err := r.db.QueryRowContext(ctx, query, subtask.TaskID, subtask.Title, subtask.IsCompleted).
		Scan(&subtask.ID, &subtask.CreatedAt)
	if err != nil {
		return fmt.Errorf("failed to insert subtask: %w", err)
	}
	return nil
}

func (r *SubtaskRepository) ListSubtasksByTaskID(ctx context.Context, taskID string) ([]domain.Subtask, error) {
	query := `
		SELECT id, task_id, title, is_completed, created_at
		FROM subtasks
		WHERE task_id = $1
		ORDER BY created_at ASC
	`
	rows, err := r.db.QueryContext(ctx, query, taskID)
	if err != nil {
		return nil, fmt.Errorf("failed to query subtasks: %w", err)
	}
	defer rows.Close()

	var subtasks []domain.Subtask
	for rows.Next() {
		var s SubtaskDB
		if err := rows.Scan(&s.ID, &s.TaskID, &s.Title, &s.IsCompleted, &s.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan subtask row: %w", err)
		}
		subtasks = append(subtasks, *s.ToDomain())
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error during subtasks iteration: %w", err)
	}
	return subtasks, nil
}

func (r *SubtaskRepository) GetSubtaskByID(ctx context.Context, id string) (*domain.Subtask, error) {
	query := `
		SELECT id, task_id, title, is_completed, created_at
		FROM subtasks
		WHERE id = $1
	`
	var s SubtaskDB
	err := r.db.QueryRowContext(ctx, query, id).Scan(&s.ID, &s.TaskID, &s.Title, &s.IsCompleted, &s.CreatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, apperrors.ErrNotFound
		}
		return nil, fmt.Errorf("failed to query subtask by id: %w", err)
	}
	return s.ToDomain(), nil
}

func (r *SubtaskRepository) UpdateSubtaskStatus(ctx context.Context, id string, isCompleted bool) error {
	query := `
		UPDATE subtasks
		SET is_completed = $1
		WHERE id = $2
	`
	result, err := r.db.ExecContext(ctx, query, isCompleted, id)
	if err != nil {
		return fmt.Errorf("failed to update subtask status: %w", err)
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to check rows affected: %w", err)
	}
	if rowsAffected == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

func (r *SubtaskRepository) DeleteSubtask(ctx context.Context, id string) error {
	query := `DELETE FROM subtasks WHERE id = $1`
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete subtask: %w", err)
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to check rows affected: %w", err)
	}
	if rowsAffected == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}
