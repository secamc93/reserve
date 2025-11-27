package domain

import "time"

// Client representa un cliente en el sistema
type Client struct {
	ID         uint
	BusinessID uint
	Name       string
	Email      string
	Phone      string
	Dni        *string
	CreatedAt  time.Time
	UpdatedAt  time.Time
	DeletedAt  *time.Time
}
