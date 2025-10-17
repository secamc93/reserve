package response

import "time"

// AttendanceListResponse - Response para lista de asistencia
type AttendanceListResponse struct {
	ID              uint      `json:"id" example:"1"`
	VotingGroupID   uint      `json:"voting_group_id" example:"1"`
	Title           string    `json:"title" example:"Asistencia Asamblea Ordinaria 2024"`
	Description     string    `json:"description" example:"Lista de asistencia para la asamblea"`
	IsActive        bool      `json:"is_active" example:"true"`
	CreatedByUserID *uint     `json:"created_by_user_id,omitempty" example:"5"`
	Notes           string    `json:"notes" example:"Notas adicionales"`
	CreatedAt       time.Time `json:"created_at" example:"2025-01-15T10:30:00Z"`
	UpdatedAt       time.Time `json:"updated_at" example:"2025-01-15T10:30:00Z"`
}

// ProxyResponse - Response para apoderado
type ProxyResponse struct {
	ID              uint       `json:"id" example:"1"`
	BusinessID      uint       `json:"business_id" example:"1"`
	PropertyUnitID  uint       `json:"property_unit_id" example:"123"`
	ProxyName       string     `json:"proxy_name" example:"María García López"`
	ProxyDni        string     `json:"proxy_dni" example:"12345678"`
	ProxyEmail      string     `json:"proxy_email" example:"maria@email.com"`
	ProxyPhone      string     `json:"proxy_phone" example:"+57 300 123 4567"`
	ProxyAddress    string     `json:"proxy_address" example:"Calle 123 #45-67"`
	ProxyType       string     `json:"proxy_type" example:"external"`
	IsActive        bool       `json:"is_active" example:"true"`
	StartDate       time.Time  `json:"start_date" example:"2025-01-15T00:00:00Z"`
	EndDate         *time.Time `json:"end_date,omitempty" example:"2025-12-31T23:59:59Z"`
	PowerOfAttorney string     `json:"power_of_attorney" example:"Poder para representar en asambleas"`
	Notes           string     `json:"notes" example:"Notas adicionales"`
	CreatedAt       time.Time  `json:"created_at" example:"2025-01-15T10:30:00Z"`
	UpdatedAt       time.Time  `json:"updated_at" example:"2025-01-15T10:30:00Z"`
}

// AttendanceRecordResponse - Response para registro de asistencia
type AttendanceRecordResponse struct {
	ID                uint       `json:"id" example:"1"`
	AttendanceListID  uint       `json:"attendance_list_id" example:"1"`
	PropertyUnitID    uint       `json:"property_unit_id" example:"123"`
	ResidentID        *uint      `json:"resident_id,omitempty" example:"456"`
	ProxyID           *uint      `json:"proxy_id,omitempty" example:"789"`
	AttendedAsOwner   bool       `json:"attended_as_owner" example:"true"`
	AttendedAsProxy   bool       `json:"attended_as_proxy" example:"false"`
	Signature         string     `json:"signature" example:"Firma digital"`
	SignatureDate     *time.Time `json:"signature_date,omitempty" example:"2025-01-15T14:30:00Z"`
	SignatureMethod   string     `json:"signature_method" example:"digital"`
	VerifiedBy        *uint      `json:"verified_by,omitempty" example:"5"`
	VerificationDate  *time.Time `json:"verification_date,omitempty" example:"2025-01-15T15:00:00Z"`
	VerificationNotes string     `json:"verification_notes" example:"Verificado por administrador"`
	Notes             string     `json:"notes" example:"Notas adicionales"`
	IsValid           bool       `json:"is_valid" example:"true"`
	CreatedAt         time.Time  `json:"created_at" example:"2025-01-15T10:30:00Z"`
	UpdatedAt         time.Time  `json:"updated_at" example:"2025-01-15T10:30:00Z"`
	ResidentName      string     `json:"resident_name" example:"Juan Pérez"`
	ProxyName         string     `json:"proxy_name" example:"María García"`
	UnitNumber        string     `json:"unit_number" example:"CASA 126"`
}

// AttendanceSummaryResponse - Response para resumen de asistencia
type AttendanceSummaryResponse struct {
	TotalUnits      int     `json:"total_units" example:"100"`
	AttendedUnits   int     `json:"attended_units" example:"85"`
	AbsentUnits     int     `json:"absent_units" example:"15"`
	AttendedAsOwner int     `json:"attended_as_owner" example:"70"`
	AttendedAsProxy int     `json:"attended_as_proxy" example:"15"`
	AttendanceRate  float64 `json:"attendance_rate" example:"85.0"`
}

// SuccessResponse - Response genérico de éxito
type SuccessResponse[T any] struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    T      `json:"data"`
}

// ErrorResponse - Response de error
type ErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Error   string `json:"error"`
}

// Tipos de respuesta con datos
type AttendanceListSuccess = SuccessResponse[AttendanceListResponse]
type AttendanceListsSuccess = SuccessResponse[[]AttendanceListResponse]
type ProxySuccess = SuccessResponse[ProxyResponse]
type ProxiesSuccess = SuccessResponse[[]ProxyResponse]
type AttendanceRecordSuccess = SuccessResponse[AttendanceRecordResponse]
type AttendanceRecordsSuccess = SuccessResponse[[]AttendanceRecordResponse]
type AttendanceSummarySuccess = SuccessResponse[AttendanceSummaryResponse]
