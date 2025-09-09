package domain

import "time"

// Table representa una mesa en el sistema
type Table struct {
	ID         uint
	BusinessID uint
	Number     int
	Capacity   int
	CreatedAt  time.Time
	UpdatedAt  time.Time
	DeletedAt  *time.Time
}
