package domain

import "time"

type Subtask struct {
	ID          string
	TaskID      string
	Title       string
	IsCompleted bool
	CreatedAt   time.Time
}
