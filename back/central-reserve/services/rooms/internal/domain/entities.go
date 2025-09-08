package domain

import "time"

type Room struct {
	ID          uint
	BusinessID  uint
	Name        string
	Code        string
	Description string
	Capacity    int
	IsActive    bool
	MinCapacity int
	MaxCapacity int
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   *time.Time
}
