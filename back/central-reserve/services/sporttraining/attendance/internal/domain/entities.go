package domain

import "time"

// AttendanceRecord - Entidad de registro de asistencia
type AttendanceRecord struct {
	ID                  uint
	TrainingSessionID   uint
	PlayerID            uint
	AttendanceStatusID  uint
	CheckInTime         *time.Time
	CheckOutTime        *time.Time
	RecordedByCoachID   uint
	RecordedAt          time.Time
	PerformanceRating   *int
	CoachFeedback       string
	PlayerNotes         string
	JustificationReason string
	JustificationProof  string
	CreatedAt           time.Time
	UpdatedAt           time.Time

	// Relaciones
	TrainingSession  *SessionRef
	Player           *PlayerRef
	AttendanceStatus *StatusRef
	RecordedByCoach  *CoachRef
}

// SessionRef - Referencia a sesión de entrenamiento
type SessionRef struct {
	ID            uint
	ScheduledDate time.Time
	Location      string
}

// PlayerRef - Referencia a jugador
type PlayerRef struct {
	ID        uint
	FirstName string
	LastName  string
}

// StatusRef - Referencia a estado de asistencia
type StatusRef struct {
	ID    uint
	Name  string
	Code  string
	Color string
}

// CoachRef - Referencia a entrenador
type CoachRef struct {
	ID        uint
	FirstName string
	LastName  string
}
