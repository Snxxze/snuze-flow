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

type TaskDB struct {
	ID          string         `db:"id"`
	ProjectID   string         `db:"project_id"`
	Title       string         `db:"title"`
	Description sql.NullString `db:"description"`
	Status      string         `db:"status"`
	Priority    string         `db:"priority"`
	DueDate     sql.NullTime   `db:"due_date"`
	AssigneeID  sql.NullString `db:"assignee_id"`
	CreatedAt   time.Time      `db:"created_at"`

	AssigneeEmail       sql.NullString `db:"assignee_email"`
	AssigneeUsername    sql.NullString `db:"assignee_username"`
	AssigneeDisplayName sql.NullString `db:"assignee_display_name"`
	SubtaskTotalCount   sql.NullInt64  `db:"subtask_total_count"`
	SubtaskCompletedCount sql.NullInt64 `db:"subtask_completed_count"`
}

func (t *TaskDB) ToDomain() *domain.Task {
	task := &domain.Task{
		ID:        t.ID,
		ProjectID: t.ProjectID,
		Title:     t.Title,
		Status:    domain.TaskStatus(t.Status),
		Priority:  domain.TaskPriority(t.Priority),
		CreatedAt: t.CreatedAt,
	}

	if t.Description.Valid {
		task.Description = t.Description.String
	}
	if t.DueDate.Valid {
		task.DueDate = &t.DueDate.Time
	}
	if t.AssigneeID.Valid {
		task.AssigneeID = &t.AssigneeID.String
	}
	if t.AssigneeEmail.Valid {
		task.AssigneeEmail = t.AssigneeEmail.String
	}
	if t.AssigneeUsername.Valid {
		task.AssigneeUsername = t.AssigneeUsername.String
	}
	if t.AssigneeDisplayName.Valid {
		task.AssigneeDisplayName = t.AssigneeDisplayName.String
	}
	if t.SubtaskTotalCount.Valid {
		task.SubtaskTotalCount = int(t.SubtaskTotalCount.Int64)
	}
	if t.SubtaskCompletedCount.Valid {
		task.SubtaskCompletedCount = int(t.SubtaskCompletedCount.Int64)
	}

	return task
}

type TaskRepository struct {
	db *sql.DB
}

func NewTaskRepository(db *sql.DB) *TaskRepository {
	return &TaskRepository{db: db}
}

func (r *TaskRepository) CreateTask(ctx context.Context, task *domain.Task) error {
	query := `
		INSERT INTO tasks (project_id, title, description, status, priority, due_date, assignee_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at
	`
	var desc sql.NullString
	if task.Description != "" {
		desc = sql.NullString{String: task.Description, Valid: true}
	}
	var assignee sql.NullString
	if task.AssigneeID != nil && *task.AssigneeID != "" {
		assignee = sql.NullString{String: *task.AssigneeID, Valid: true}
	}

	err := r.db.QueryRowContext(ctx, query, task.ProjectID, task.Title, desc, string(task.Status), string(task.Priority), task.DueDate, assignee).
		Scan(&task.ID, &task.CreatedAt)
	if err != nil {
		return fmt.Errorf("failed to insert task: %w", err)
	}
	return nil
}

func (r *TaskRepository) ListTasksByProjectID(ctx context.Context, projectID string) ([]domain.Task, error) {
	query := `
		SELECT t.id, t.project_id, t.title, t.description, t.status, t.priority, t.due_date, t.assignee_id, t.created_at,
		       u.email as assignee_email, u.username as assignee_username, u.display_name as assignee_display_name,
		       COALESCE(st.total_count, 0) as subtask_total_count,
		       COALESCE(st.completed_count, 0) as subtask_completed_count
		FROM tasks t
		LEFT JOIN users u ON t.assignee_id = u.id
		LEFT JOIN (
			SELECT task_id, COUNT(*) as total_count, COUNT(CASE WHEN is_completed THEN 1 END) as completed_count
			FROM subtasks
			GROUP BY task_id
		) st ON t.id = st.task_id
		WHERE t.project_id = $1
		ORDER BY t.created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query, projectID)
	if err != nil {
		return nil, fmt.Errorf("failed to query project tasks: %w", err)
	}
	defer rows.Close()

	var tasks []domain.Task
	for rows.Next() {
		var t TaskDB
		if err := rows.Scan(
			&t.ID, &t.ProjectID, &t.Title, &t.Description, &t.Status, &t.Priority, &t.DueDate, &t.AssigneeID, &t.CreatedAt,
			&t.AssigneeEmail, &t.AssigneeUsername, &t.AssigneeDisplayName,
			&t.SubtaskTotalCount, &t.SubtaskCompletedCount,
		); err != nil {
			return nil, fmt.Errorf("failed to scan task row: %w", err)
		}
		tasks = append(tasks, *t.ToDomain())
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error during tasks iteration: %w", err)
	}
	return tasks, nil
}

func (r *TaskRepository) GetTaskByID(ctx context.Context, id string) (*domain.Task, error) {
	query := `
		SELECT t.id, t.project_id, t.title, t.description, t.status, t.priority, t.due_date, t.assignee_id, t.created_at,
		       u.email as assignee_email, u.username as assignee_username, u.display_name as assignee_display_name
		FROM tasks t
		LEFT JOIN users u ON t.assignee_id = u.id
		WHERE t.id = $1
	`
	var t TaskDB
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&t.ID, &t.ProjectID, &t.Title, &t.Description, &t.Status, &t.Priority, &t.DueDate, &t.AssigneeID, &t.CreatedAt,
		&t.AssigneeEmail, &t.AssigneeUsername, &t.AssigneeDisplayName,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, apperrors.ErrNotFound
		}
		return nil, fmt.Errorf("failed to query task by id: %w", err)
	}
	return t.ToDomain(), nil
}

func (r *TaskRepository) UpdateTaskStatus(ctx context.Context, id string, status domain.TaskStatus) error {
	query := `
		UPDATE tasks
		SET status = $1
		WHERE id = $2
	`
	result, err := r.db.ExecContext(ctx, query, string(status), id)
	if err != nil {
		return fmt.Errorf("failed to update task status: %w", err)
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

func (r *TaskRepository) DeleteTask(ctx context.Context, id string) error {
	query := `DELETE FROM tasks WHERE id = $1`
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete task: %w", err)
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

func (r *TaskRepository) UpdateTask(ctx context.Context, id string, title *string, description *string, priority *string, status *string, dueDate *time.Time, assigneeID *string) (*domain.Task, error) {
	query := `
		UPDATE tasks
		SET title = COALESCE($1, title),
		    description = COALESCE($2, description),
		    priority = COALESCE($3, priority),
		    status = COALESCE($4, status),
		    due_date = COALESCE($5, due_date),
		    assignee_id = COALESCE($6, assignee_id)
		WHERE id = $7
	`
	result, err := r.db.ExecContext(ctx, query, title, description, priority, status, dueDate, assigneeID, id)
	if err != nil {
		return nil, fmt.Errorf("failed to update task: %w", err)
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return nil, fmt.Errorf("failed to check rows affected: %w", err)
	}
	if rowsAffected == 0 {
		return nil, apperrors.ErrNotFound
	}
	return r.GetTaskByID(ctx, id)
}

func (r *TaskRepository) ListDashboardTasksByUserID(ctx context.Context, userID string) ([]domain.Task, error) {
	query := `
		SELECT t.id, t.project_id, t.title, t.description, t.status, t.priority, t.due_date, t.assignee_id, t.created_at,
		       u.email as assignee_email, u.username as assignee_username, u.display_name as assignee_display_name
		FROM tasks t
		INNER JOIN project_members pm ON t.project_id = pm.project_id
		LEFT JOIN users u ON t.assignee_id = u.id
		WHERE pm.user_id = $1 AND t.status != 'done'
		ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to query dashboard tasks: %w", err)
	}
	defer rows.Close()

	var tasks []domain.Task
	for rows.Next() {
		var t TaskDB
		if err := rows.Scan(
			&t.ID, &t.ProjectID, &t.Title, &t.Description, &t.Status, &t.Priority, &t.DueDate, &t.AssigneeID, &t.CreatedAt,
			&t.AssigneeEmail, &t.AssigneeUsername, &t.AssigneeDisplayName,
		); err != nil {
			return nil, fmt.Errorf("failed to scan task row: %w", err)
		}
		tasks = append(tasks, *t.ToDomain())
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error during dashboard tasks iteration: %w", err)
	}
	return tasks, nil
}
