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

type ProjectDB struct {
	ID          string    `db:"id"`
	Name        string    `db:"name"`
	Description string    `db:"description"`
	OwnerID     string    `db:"owner_id"`
	CreatedAt   time.Time `db:"created_at"`
}

func (p *ProjectDB) ToDomain() *domain.Project {
	return &domain.Project{
		ID:          p.ID,
		Name:        p.Name,
		Description: p.Description,
		OwnerID:     p.OwnerID,
		CreatedAt:   p.CreatedAt,
	}
}

type ProjectRepository struct {
	db *sql.DB
}

func NewProjectRepository(db *sql.DB) *ProjectRepository {
	return &ProjectRepository{db: db}
}

func (r *ProjectRepository) CreateProject(ctx context.Context, project *domain.Project) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback()

	queryProject := `
		INSERT INTO projects (name, description, owner_id)
		VALUES ($1, $2, $3)
		RETURNING id, created_at
	`
	err = tx.QueryRowContext(ctx, queryProject, project.Name, project.Description, project.OwnerID).
		Scan(&project.ID, &project.CreatedAt)
	if err != nil {
		return fmt.Errorf("failed to insert project: %w", err)
	}

	queryMember := `
		INSERT INTO project_members (project_id, user_id, role)
		VALUES ($1, $2, $3)
	`
	_, err = tx.ExecContext(ctx, queryMember, project.ID, project.OwnerID, string(domain.RoleOwner))
	if err != nil {
		return fmt.Errorf("failed to insert owner member: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}
	return nil
}

func (r *ProjectRepository) GetProjectByID(ctx context.Context, id string) (*domain.Project, error) {
	query := `
		SELECT id, name, description, owner_id, created_at
		FROM projects
		WHERE id = $1
	`
	var p ProjectDB
	err := r.db.QueryRowContext(ctx, query, id).
		Scan(&p.ID, &p.Name, &p.Description, &p.OwnerID, &p.CreatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, apperrors.ErrNotFound
		}
		return nil, fmt.Errorf("failed to query project by id: %w", err)
	}
	return p.ToDomain(), nil
}

func (r *ProjectRepository) ListProjectsByUserID(ctx context.Context, userID string) ([]domain.Project, error) {
	query := `
		SELECT p.id, p.name, p.description, p.owner_id, p.created_at
		FROM projects p
		INNER JOIN project_members pm ON p.id = pm.project_id
		WHERE pm.user_id = $1
		ORDER BY p.created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to query user projects: %w", err)
	}
	defer rows.Close()

	var projects []domain.Project
	for rows.Next() {
		var p ProjectDB
		if err := rows.Scan(&p.ID, &p.Name, &p.Description, &p.OwnerID, &p.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan project row: %w", err)
		}
		projects = append(projects, *p.ToDomain())
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error during projects iteration: %w", err)
	}
	return projects, nil
}

func (r *ProjectRepository) GetProjectMemberRole(ctx context.Context, projectID, userID string) (domain.ProjectRole, error) {
	query := `
		SELECT role
		FROM project_members
		WHERE project_id = $1 AND user_id = $2
	`
	var role string
	err := r.db.QueryRowContext(ctx, query, projectID, userID).Scan(&role)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", apperrors.ErrNotFound
		}
		return "", fmt.Errorf("failed to query project member role: %w", err)
	}
	return domain.ProjectRole(role), nil
}

func (r *ProjectRepository) ListProjectMembers(ctx context.Context, projectID string) ([]domain.ProjectMember, error) {
	query := `
		SELECT pm.project_id, pm.user_id, pm.role, pm.joined_at, u.email, u.username, u.display_name
		FROM project_members pm
		INNER JOIN users u ON pm.user_id = u.id
		WHERE pm.project_id = $1
		ORDER BY pm.joined_at ASC
	`
	rows, err := r.db.QueryContext(ctx, query, projectID)
	if err != nil {
		return nil, fmt.Errorf("failed to list project members: %w", err)
	}
	defer rows.Close()

	var members []domain.ProjectMember
	for rows.Next() {
		var m domain.ProjectMember
		var roleStr string
		if err := rows.Scan(&m.ProjectID, &m.UserID, &roleStr, &m.JoinedAt, &m.Email, &m.Username, &m.DisplayName); err != nil {
			return nil, fmt.Errorf("failed to scan project member row: %w", err)
		}
		m.Role = domain.ProjectRole(roleStr)
		members = append(members, m)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error during members iteration: %w", err)
	}
	return members, nil
}

// Invitations DB Queries
func (r *ProjectRepository) CreateInvitation(ctx context.Context, invitation *domain.ProjectInvitation) error {
	query := `
		INSERT INTO project_invitations (project_id, invited_user_id, invited_by_id, status)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at
	`
	err := r.db.QueryRowContext(ctx, query, invitation.ProjectID, invitation.InvitedUserID, invitation.InvitedByID, string(invitation.Status)).
		Scan(&invitation.ID, &invitation.CreatedAt)
	if err != nil {
		return fmt.Errorf("failed to insert project invitation: %w", err)
	}
	return nil
}

func (r *ProjectRepository) ListPendingInvitationsByUserID(ctx context.Context, userID string) ([]domain.ProjectInvitation, error) {
	query := `
		SELECT pi.id, pi.project_id, pi.invited_user_id, pi.invited_by_id, pi.status, pi.created_at, p.name as project_name, u.display_name as invited_by
		FROM project_invitations pi
		INNER JOIN projects p ON pi.project_id = p.id
		INNER JOIN users u ON pi.invited_by_id = u.id
		WHERE pi.invited_user_id = $1 AND pi.status = 'pending'
		ORDER BY pi.created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to list pending invitations: %w", err)
	}
	defer rows.Close()

	var invitations []domain.ProjectInvitation
	for rows.Next() {
		var inv domain.ProjectInvitation
		var statusStr string
		if err := rows.Scan(&inv.ID, &inv.ProjectID, &inv.InvitedUserID, &inv.InvitedByID, &statusStr, &inv.CreatedAt, &inv.ProjectName, &inv.InvitedBy); err != nil {
			return nil, fmt.Errorf("failed to scan invitation row: %w", err)
		}
		inv.Status = domain.InvitationStatus(statusStr)
		invitations = append(invitations, inv)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error during invitations iteration: %w", err)
	}
	return invitations, nil
}

func (r *ProjectRepository) RespondToInvitation(ctx context.Context, invitationID, userID string, accept bool) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback()

	queryGet := `
		SELECT project_id, status
		FROM project_invitations
		WHERE id = $1 AND invited_user_id = $2
	`
	var projectID, status string
	err = tx.QueryRowContext(ctx, queryGet, invitationID, userID).Scan(&projectID, &status)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return apperrors.ErrNotFound
		}
		return fmt.Errorf("failed to query invitation: %w", err)
	}

	if status != string(domain.InvitationPending) {
		return &apperrors.AppError{
			Code:    "CONFLICT",
			Message: "Invitation has already been processed",
			Err:     apperrors.ErrConflict,
		}
	}

	newStatus := domain.InvitationRejected
	if accept {
		newStatus = domain.InvitationAccepted
	}

	queryUpdate := `
		UPDATE project_invitations
		SET status = $1
		WHERE id = $2
	`
	if _, err := tx.ExecContext(ctx, queryUpdate, string(newStatus), invitationID); err != nil {
		return fmt.Errorf("failed to update invitation status: %w", err)
	}

	if accept {
		queryMember := `
			INSERT INTO project_members (project_id, user_id, role)
			VALUES ($1, $2, $3)
			ON CONFLICT (project_id, user_id) DO NOTHING
		`
		if _, err := tx.ExecContext(ctx, queryMember, projectID, userID, string(domain.RoleMember)); err != nil {
			return fmt.Errorf("failed to add member to project: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}
	return nil
}

func (r *ProjectRepository) GetProjectStats(ctx context.Context, projectID string) (*domain.ProjectStats, error) {
	queryStats := `
		SELECT 
			COUNT(*) as total_tasks,
			COUNT(CASE WHEN status = 'todo' THEN 1 END) as todo_tasks,
			COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
			COUNT(CASE WHEN status = 'done' THEN 1 END) as done_tasks,
			COUNT(CASE WHEN due_date < NOW() AND status != 'done' THEN 1 END) as overdue_tasks
		FROM tasks
		WHERE project_id = $1
	`
	var stats domain.ProjectStats
	err := r.db.QueryRowContext(ctx, queryStats, projectID).Scan(
		&stats.TotalTasks, &stats.TodoTasks, &stats.InProgressTasks, &stats.DoneTasks, &stats.OverdueTasks,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query task stats: %w", err)
	}

	queryMembers := `SELECT COUNT(*) FROM project_members WHERE project_id = $1`
	err = r.db.QueryRowContext(ctx, queryMembers, projectID).Scan(&stats.TotalMembers)
	if err != nil {
		return nil, fmt.Errorf("failed to query member count: %w", err)
	}

	if stats.TotalTasks > 0 {
		stats.CompletionRate = (stats.DoneTasks * 100) / stats.TotalTasks
	}

	return &stats, nil
}

func (r *ProjectRepository) UpdateProject(ctx context.Context, id string, name *string, description *string) (*domain.Project, error) {
	query := `
		UPDATE projects
		SET name = COALESCE($1, name),
		    description = COALESCE($2, description)
		WHERE id = $3
		RETURNING id, name, description, owner_id, created_at
	`
	var p ProjectDB
	err := r.db.QueryRowContext(ctx, query, name, description, id).
		Scan(&p.ID, &p.Name, &p.Description, &p.OwnerID, &p.CreatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, apperrors.ErrNotFound
		}
		return nil, fmt.Errorf("failed to update project: %w", err)
	}
	return p.ToDomain(), nil
}

func (r *ProjectRepository) DeleteProject(ctx context.Context, id string) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback()

	queries := []string{
		`DELETE FROM subtasks WHERE task_id IN (SELECT id FROM tasks WHERE project_id = $1)`,
		`DELETE FROM tasks WHERE project_id = $1`,
		`DELETE FROM project_invitations WHERE project_id = $1`,
		`DELETE FROM project_members WHERE project_id = $1`,
		`DELETE FROM projects WHERE id = $1`,
	}

	for _, q := range queries {
		if _, err := tx.ExecContext(ctx, q, id); err != nil {
			return fmt.Errorf("failed to execute delete: %w", err)
		}
	}

	return tx.Commit()
}

