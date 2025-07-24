package entities

import "time"

// Room representa una sala dentro de un negocio
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
