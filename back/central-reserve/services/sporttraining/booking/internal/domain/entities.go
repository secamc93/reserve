package domain

import "time"

// Booking - Entidad de reserva de sesión
type Booking struct {
	ID                 uint
	TrainingSessionID  uint
	PlayerID           uint
	BookedByUserID     uint
	BookingStatusID    uint
	BookingDate        time.Time
	RequestNotes       string
	ReviewedAt         *time.Time
	ReviewedByCoachID  *uint
	ResponseNotes      string
	CancelledAt        *time.Time
	CancelledByUserID  *uint
	CancellationReason string
	Price              *float64
	IsPaid             bool
	PaymentDate        *time.Time
	PaymentMethod      string
	CreatedAt          time.Time
	UpdatedAt          time.Time

	// Relaciones
	Session *SessionRef
	Player  *PlayerRef
	Status  *StatusRef
}

// SessionRef - Sesión de entrenamiento (referencia)
type SessionRef struct {
	ID            uint
	ScheduledDate time.Time
	SessionMode   string
	Location      string
}

// PlayerRef - Jugador (referencia)
type PlayerRef struct {
	ID        uint
	FirstName string
	LastName  string
}

// StatusRef - Estado de reserva (referencia)
type StatusRef struct {
	ID      uint
	Name    string
	Code    string
	Color   string
	IsFinal bool
}
