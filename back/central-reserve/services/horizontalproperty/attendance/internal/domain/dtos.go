package domain

import "time"

// ============================================================================
// ATTENDANCE DTOs - DTOs para gestión de asistencia
// ============================================================================

// CreateAttendanceListDTO - DTO para crear lista de asistencia
type CreateAttendanceListDTO struct {
	VotingGroupID   uint
	Title           string
	Description     string
	CreatedByUserID *uint
	Notes           string
}

// UpdateAttendanceListDTO - DTO para actualizar lista de asistencia
type UpdateAttendanceListDTO struct {
	Title       string
	Description string
	IsActive    *bool
	Notes       string
}

// AttendanceListDTO - DTO para respuesta de lista de asistencia
type AttendanceListDTO struct {
	ID              uint
	VotingGroupID   uint
	Title           string
	Description     string
	IsActive        bool
	CreatedByUserID *uint
	Notes           string
	CreatedAt       time.Time
	UpdatedAt       time.Time
}

// CreateProxyDTO - DTO para crear apoderado
type CreateProxyDTO struct {
	BusinessID      uint
	PropertyUnitID  uint
	ProxyName       string
	ProxyDni        string
	ProxyEmail      string
	ProxyPhone      string
	ProxyAddress    string
	ProxyType       string
	StartDate       *time.Time
	EndDate         *time.Time
	PowerOfAttorney string
	Notes           string
}

// UpdateProxyDTO - DTO para actualizar apoderado
type UpdateProxyDTO struct {
	ProxyName       string
	ProxyDni        string
	ProxyEmail      string
	ProxyPhone      string
	ProxyAddress    string
	ProxyType       string
	IsActive        *bool
	StartDate       *time.Time
	EndDate         *time.Time
	PowerOfAttorney string
	Notes           string
}

// ProxyDTO - DTO para respuesta de apoderado
type ProxyDTO struct {
	ID              uint
	BusinessID      uint
	PropertyUnitID  uint
	ProxyName       string
	ProxyDni        string
	ProxyEmail      string
	ProxyPhone      string
	ProxyAddress    string
	ProxyType       string
	IsActive        bool
	StartDate       time.Time
	EndDate         *time.Time
	PowerOfAttorney string
	Notes           string
	CreatedAt       time.Time
	UpdatedAt       time.Time
}

// CreateAttendanceRecordDTO - DTO para crear registro de asistencia
type CreateAttendanceRecordDTO struct {
	AttendanceListID uint
	PropertyUnitID   uint
	ResidentID       *uint
	ProxyID          *uint
	AttendedAsOwner  bool
	AttendedAsProxy  bool
	Signature        string
	SignatureMethod  string
	Notes            string
}

// UpdateAttendanceRecordDTO - DTO para actualizar registro de asistencia
type UpdateAttendanceRecordDTO struct {
	ResidentID        *uint
	ProxyID           *uint
	AttendedAsOwner   *bool
	AttendedAsProxy   *bool
	Signature         string
	SignatureMethod   string
	VerifiedBy        *uint
	VerificationNotes string
	Notes             string
	IsValid           *bool
}

// AttendanceRecordDTO - DTO para respuesta de registro de asistencia
type AttendanceRecordDTO struct {
	ID                       uint
	AttendanceListID         uint
	PropertyUnitID           uint
	ResidentID               *uint
	ProxyID                  *uint
	AttendedAsOwner          bool
	AttendedAsProxy          bool
	Signature                string
	SignatureDate            *time.Time
	SignatureMethod          string
	VerifiedBy               *uint
	VerificationDate         *time.Time
	VerificationNotes        string
	Notes                    string
	IsValid                  bool
	CreatedAt                time.Time
	UpdatedAt                time.Time
	ResidentName             string
	ProxyName                string
	UnitNumber               string
	ParticipationCoefficient string
}

// AttendanceSummaryDTO - DTO para resumen de asistencia
type AttendanceSummaryDTO struct {
	TotalUnits           int
	AttendedUnits        int
	AbsentUnits          int
	AttendedAsOwner      int
	AttendedAsProxy      int
	AttendanceRate       float64
	AbsenceRate          float64
	AttendanceRateByCoef float64
	AbsenceRateByCoef    float64
}

// PaginatedAttendanceRecordsDTO - respuesta paginada de registros de asistencia
type PaginatedAttendanceRecordsDTO struct {
	Data       []AttendanceRecordDTO
	Total      int64
	Page       int
	PageSize   int
	TotalPages int
}
