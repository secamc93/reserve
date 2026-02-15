package domain

import "time"

// CreateAttendanceDTO - DTO para crear registro de asistencia
type CreateAttendanceDTO struct {
	TrainingSessionID  uint
	PlayerID           uint
	AttendanceStatusID uint
	RecordedByCoachID  uint
	BusinessID         uint
	CheckInTime        *time.Time
	PerformanceRating  *int
	CoachFeedback      string
	PlayerNotes        string
}

// AttendanceFiltersDTO - Filtros para listar registros de asistencia
type AttendanceFiltersDTO struct {
	BusinessID        uint
	TrainingSessionID *uint
	PlayerID          *uint
	Page              int
	PageSize          int
}

// PaginatedAttendanceDTO - Resultado paginado de registros de asistencia
type PaginatedAttendanceDTO struct {
	Records    []AttendanceListDTO
	Total      int64
	Page       int
	PageSize   int
	TotalPages int
}

// AttendanceListDTO - DTO para lista de registros de asistencia
type AttendanceListDTO struct {
	ID                  uint
	TrainingSessionID   uint
	SessionDate         time.Time
	SessionLocation     string
	PlayerID            uint
	PlayerName          string
	AttendanceStatusID  uint
	StatusName          string
	StatusCode          string
	StatusColor         string
	CheckInTime         *time.Time
	CheckOutTime        *time.Time
	PerformanceRating   *int
	RecordedByCoachID   uint
	RecordedByCoachName string
	RecordedAt          time.Time
	CreatedAt           time.Time
}
