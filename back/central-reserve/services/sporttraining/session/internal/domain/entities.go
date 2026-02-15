package domain

import "time"

// TrainingSession - Entidad de sesión de entrenamiento
type TrainingSession struct {
	ID                    uint
	BusinessID            uint
	TrainingSessionTypeID uint
	CoachID               uint
	TrainingGroupID       *uint
	SessionMode           string
	ScheduledDate         time.Time
	StartTime             time.Time
	EndTime               time.Time
	Duration              int
	Location              string
	Field                 string
	MaxParticipants       *int
	CurrentParticipants   int
	Price                 *float64
	Status                string
	IsRecurring           bool
	CoachNotes            string
	PublicNotes           string
	CancellationReason    string
	CreatedAt             time.Time
	UpdatedAt             time.Time

	// Relaciones
	SessionType *SessionType
	Coach       *CoachRef
	Group       *GroupRef
}

// SessionType - Tipo de sesión (referencia)
type SessionType struct {
	ID    uint
	Name  string
	Code  string
	Color string
}

// CoachRef - Referencia al entrenador
type CoachRef struct {
	ID        uint
	FirstName string
	LastName  string
}

// GroupRef - Referencia al grupo
type GroupRef struct {
	ID       uint
	Name     string
	Category string
}
