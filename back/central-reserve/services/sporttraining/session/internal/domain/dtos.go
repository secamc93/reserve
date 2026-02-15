package domain

import "time"

// CreateSessionDTO - DTO para crear sesión
type CreateSessionDTO struct {
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
	Price                 *float64
	IsRecurring           bool
	CoachNotes            string
	PublicNotes           string
}

// UpdateSessionDTO - DTO para actualizar sesión
type UpdateSessionDTO struct {
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
	Price                 *float64
	IsRecurring           bool
	CoachNotes            string
	PublicNotes           string
}

// SessionFiltersDTO - Filtros para listar sesiones
type SessionFiltersDTO struct {
	BusinessID      uint
	CoachID         *uint
	TrainingGroupID *uint
	SessionTypeID   *uint
	Status          string
	StartDate       *time.Time
	EndDate         *time.Time
	Page            int
	PageSize        int
}

// PaginatedSessionsDTO - Resultado paginado de sesiones
type PaginatedSessionsDTO struct {
	Sessions   []SessionListDTO
	Total      int64
	Page       int
	PageSize   int
	TotalPages int
}

// SessionListDTO - DTO para lista de sesiones
type SessionListDTO struct {
	ID                  uint
	SessionTypeName     string
	SessionTypeCode     string
	CoachName           string
	GroupName           string
	SessionMode         string
	ScheduledDate       time.Time
	StartTime           time.Time
	EndTime             time.Time
	Duration            int
	Location            string
	Field               string
	MaxParticipants     *int
	CurrentParticipants int
	Price               *float64
	Status              string
	IsRecurring         bool
	CreatedAt           time.Time
}

// CancelSessionDTO - DTO para cancelar sesión
type CancelSessionDTO struct {
	ID         uint
	BusinessID uint
	Reason     string
}
