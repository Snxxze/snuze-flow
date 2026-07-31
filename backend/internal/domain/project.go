package domain

import "time"

type ProjectRole string

const (
	RoleOwner  ProjectRole = "owner"
	RoleMember ProjectRole = "member"
)

type InvitationStatus string

const (
	InvitationPending  InvitationStatus = "pending"
	InvitationAccepted InvitationStatus = "accepted"
	InvitationRejected InvitationStatus = "rejected"
)

type Project struct {
	ID          string
	Name        string
	Description string
	OwnerID     string
	CreatedAt   time.Time
	Members     []ProjectMember
}

type ProjectMember struct {
	ProjectID   string
	UserID      string
	Role        ProjectRole
	JoinedAt    time.Time
	Email       string
	Username    string
	DisplayName string
}

type ProjectInvitation struct {
	ID            string
	ProjectID     string
	InvitedUserID string
	InvitedByID   string
	Status        InvitationStatus
	CreatedAt     time.Time
	ProjectName   string
	InvitedBy     string
}

type ProjectStats struct {
	TotalTasks      int
	TodoTasks       int
	InProgressTasks int
	DoneTasks       int
	OverdueTasks    int
	TotalMembers    int
	CompletionRate  int
}
