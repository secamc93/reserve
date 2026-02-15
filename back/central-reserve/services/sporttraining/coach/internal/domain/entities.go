package domain

import "time"

// Coach - Entidad de entrenador
type Coach struct {
	ID                 uint
	BusinessID         uint
	UserID             uint
	FirstName          string
	LastName           string
	DocumentType       string
	DocumentNumber     string
	Email              string
	Phone              string
	LicenseNumber      *string
	YearsOfExperience  *int
	Biography          string
	Certifications     string
	IsAvailable        bool
	MaxSessionsPerDay  *int
	MaxSessionsPerWeek *int
	HourlyRate         *float64
	PhotoURL           string
	Notes              string
	IsActive           bool
	CreatedAt          time.Time
	UpdatedAt          time.Time

	// Relaciones
	Specialties []SpecialtyAssignment
}

// SpecialtyAssignment - Asignación de especialidad a un entrenador
type SpecialtyAssignment struct {
	ID               uint
	CoachID          uint
	SpecialtyID      uint
	SpecialtyName    string
	SpecialtyCode    string
	ProficiencyLevel int
	CreatedAt        time.Time
}
