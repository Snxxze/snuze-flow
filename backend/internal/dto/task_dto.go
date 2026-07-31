package dto

type CreateTaskRequest struct {
	Title       string  `json:"title" binding:"required,min=2,max=255"`
	Description string  `json:"description" binding:"max=2000"`
	Priority    string  `json:"priority" binding:"required,oneof=low medium high"`
	DueDate     *string `json:"dueDate"` // RFC3339 timestamp string or null
	AssigneeID  *string `json:"assigneeId"`
}

type UpdateTaskStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=todo in_progress done"`
}

type UpdateTaskRequest struct {
	Title       *string `json:"title" binding:"omitempty,min=2,max=255"`
	Description *string `json:"description" binding:"omitempty,max=2000"`
	Priority    *string `json:"priority" binding:"omitempty,oneof=low medium high"`
	Status      *string `json:"status" binding:"omitempty,oneof=todo in_progress done"`
	DueDate     *string `json:"dueDate"`
	AssigneeID  *string `json:"assigneeId"`
}

type TaskAssigneeResponse struct {
	ID          string `json:"id"`
	Email       string `json:"email"`
	Username    string `json:"username"`
	DisplayName string `json:"displayName"`
}

type SubtaskStatsResponse struct {
	TotalCount     int `json:"totalCount"`
	CompletedCount int `json:"completedCount"`
}

type TaskResponse struct {
	ID           string                `json:"id"`
	ProjectID    string                `json:"projectId"`
	Title        string                `json:"title"`
	Description  string                `json:"description"`
	Status       string                `json:"status"`   // todo, in_progress, done
	Priority     string                `json:"priority"` // low, medium, high
	DueDate      *string               `json:"dueDate"`
	Assignee     *TaskAssigneeResponse `json:"assignee,omitempty"`
	SubtaskStats *SubtaskStatsResponse `json:"subtaskStats,omitempty"`
	CreatedAt    string                `json:"createdAt"`
}
