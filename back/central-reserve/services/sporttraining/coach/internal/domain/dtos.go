package domain

import "time"

// CreateCoachDTO - DTO para crear entrenador
type CreateCoachDTO struct {
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
	MaxSessionsPerDay  *int
	MaxSessionsPerWeek *int
	HourlyRate         *float64
	PhotoURL           string
	Notes              string
}

// UpdateCoachDTO - DTO para actualizar entrenador
type UpdateCoachDTO struct {
	ID                 uint
	BusinessID         uint
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
}

// CoachFiltersDTO - Filtros para listar entrenadores
type CoachFiltersDTO struct {
	BusinessID  uint
	Name        string
	IsAvailable *bool
	IsActive    *bool
	Page        int
	PageSize    int
}

// PaginatedCoachesDTO - Resultado paginado de entrenadores
type PaginatedCoachesDTO struct {
	Coaches    []CoachListDTO
	Total      int64
	Page       int
	PageSize   int
	TotalPages int
}

// CoachListDTO - DTO para lista de entrenadores
type CoachListDTO struct {
	ID                uint
	FirstName         string
	LastName          string
	DocumentNumber    string
	Email             string
	Phone             string
	YearsOfExperience *int
	IsAvailable       bool
	IsActive          bool
	CreatedAt         time.Time
}

// AssignSpecialtyDTO - DTO para asignar especialidad
type AssignSpecialtyDTO struct {
	CoachID          uint
	SpecialtyID      uint
	ProficiencyLevel int
}
