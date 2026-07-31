package dto

type CreateSubtaskRequest struct {
	Title string `json:"title" binding:"required,min=1,max=255"`
}

type UpdateSubtaskStatusRequest struct {
	IsCompleted bool `json:"isCompleted"`
}

type SubtaskResponse struct {
	ID          string `json:"id"`
	TaskID      string `json:"taskId"`
	Title       string `json:"title"`
	IsCompleted bool   `json:"isCompleted"`
	CreatedAt   string `json:"createdAt"`
}

type TaskProgressResponse struct {
	TotalSubtasks     int `json:"totalSubtasks"`
	CompletedSubtasks int `json:"completedSubtasks"`
	Percentage        int `json:"percentage"`
}
