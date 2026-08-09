package dto

type CreateProjectRequest struct {
	Name        string `json:"name" binding:"required,min=2,max=100"`
	Description string `json:"description" binding:"max=500"`
}

type UpdateProjectRequest struct {
	Name        *string `json:"name" binding:"omitempty,min=2,max=100"`
	Description *string `json:"description" binding:"omitempty,max=500"`
	Color       *string `json:"color" binding:"omitempty,len=7"`
}

type RespondInvitationRequest struct {
	Status string `json:"status" binding:"required,oneof=accepted rejected"`
}

type ProjectMemberResponse struct {
	UserID      string `json:"userId"`
	Email       string `json:"email"`
	Username    string `json:"username"`
	DisplayName string `json:"displayName"`
	Role        string `json:"role"`
	JoinedAt    string `json:"joinedAt"`
}

type ProjectResponse struct {
	ID          string                  `json:"id"`
	Name        string                  `json:"name"`
	Description string                  `json:"description"`
	OwnerID     string                  `json:"ownerId"`
	Role        string                  `json:"role,omitempty"` // Role of current requesting user
	CreatedAt      string                  `json:"createdAt"`
	CompletionRate int                     `json:"completionRate"`
	Members        []ProjectMemberResponse `json:"members,omitempty"`
}

type InviteMemberRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type InvitationResponse struct {
	ID          string `json:"id"`
	ProjectID   string `json:"projectId"`
	ProjectName string `json:"projectName"`
	InvitedBy   string `json:"invitedBy"`
	Status      string `json:"status"` // pending, accepted, rejected
	CreatedAt   string `json:"createdAt"`
}

type ProjectStatsResponse struct {
	TotalTasks      int `json:"totalTasks"`
	TodoTasks       int `json:"todoTasks"`
	InProgressTasks int `json:"inProgressTasks"`
	DoneTasks       int `json:"doneTasks"`
	OverdueTasks    int `json:"overdueTasks"`
	TotalMembers    int `json:"totalMembers"`
	CompletionRate  int `json:"completionRate"` // percentage 0-100
}
