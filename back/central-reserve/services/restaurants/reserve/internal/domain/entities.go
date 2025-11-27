package domain

import "time"

type Reservation struct {
	ID              uint
	BusinessID      uint
	TableID         *uint
	ClientID        uint
	CreatedByUserID *uint
	StartAt         time.Time
	EndAt           time.Time
	NumberOfGuests  int
	StatusID        uint
	CreatedAt       time.Time
	UpdatedAt       time.Time
	DeletedAt       *time.Time
}

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

// ReservationStatus representa el estado de una reserva
type ReservationStatus struct {
	ID        uint
	Code      string
	Name      string
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt *time.Time
}

// ReservationStatusHistory representa el historial de cambios de estado de una reserva
type ReservationStatusHistory struct {
	ID              uint
	ReservationID   uint
	StatusID        uint
	ChangedByUserID *uint
	CreatedAt       time.Time
	UpdatedAt       time.Time
	DeletedAt       *time.Time
	StatusCode      string
	StatusName      string
	ChangedByUser   *string
}
