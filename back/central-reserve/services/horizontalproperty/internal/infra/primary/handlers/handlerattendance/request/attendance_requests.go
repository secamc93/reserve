package request

import "time"

// CreateAttendanceListRequest - Request para crear lista de asistencia
type CreateAttendanceListRequest struct {
	VotingGroupID   uint   `json:"voting_group_id" binding:"required" example:"1"`
	Title           string `json:"title" binding:"required,min=3,max=200" example:"Asistencia Asamblea Ordinaria 2024"`
	Description     string `json:"description" binding:"max=1000" example:"Lista de asistencia para la asamblea ordinaria"`
	CreatedByUserID *uint  `json:"created_by_user_id,omitempty" example:"5"`
	Notes           string `json:"notes" binding:"max=2000" example:"Notas adicionales"`
}

// UpdateAttendanceListRequest - Request para actualizar lista de asistencia
type UpdateAttendanceListRequest struct {
	Title       string `json:"title" binding:"omitempty,min=3,max=200" example:"Asistencia Asamblea Ordinaria 2024 - Actualizada"`
	Description string `json:"description" binding:"omitempty,max=1000" example:"Lista actualizada"`
	IsActive    *bool  `json:"is_active,omitempty" example:"true"`
	Notes       string `json:"notes" binding:"omitempty,max=2000" example:"Notas actualizadas"`
}

// CreateProxyRequest - Request para crear apoderado
type CreateProxyRequest struct {
	BusinessID      uint       `json:"business_id" binding:"required" example:"1"`
	PropertyUnitID  uint       `json:"property_unit_id" binding:"required" example:"123"`
	ProxyName       string     `json:"proxy_name" binding:"required,min=3,max=255" example:"María García López"`
	ProxyDni        string     `json:"proxy_dni" binding:"required,min=5,max=30" example:"12345678"`
	ProxyEmail      string     `json:"proxy_email" binding:"omitempty,email,max=255" example:"maria@email.com"`
	ProxyPhone      string     `json:"proxy_phone" binding:"omitempty,max=20" example:"+57 300 123 4567"`
	ProxyAddress    string     `json:"proxy_address" binding:"omitempty,max=500" example:"Calle 123 #45-67"`
	ProxyType       string     `json:"proxy_type" binding:"required,oneof=external resident family" example:"external"`
	StartDate       time.Time  `json:"start_date" binding:"required" example:"2025-01-15T00:00:00Z"`
	EndDate         *time.Time `json:"end_date,omitempty" example:"2025-12-31T23:59:59Z"`
	PowerOfAttorney string     `json:"power_of_attorney" binding:"omitempty,max=1000" example:"Poder para representar en asambleas"`
	Notes           string     `json:"notes" binding:"omitempty,max=1000" example:"Notas adicionales"`
}

// UpdateProxyRequest - Request para actualizar apoderado
type UpdateProxyRequest struct {
	ProxyName       string     `json:"proxy_name" binding:"omitempty,min=3,max=255" example:"María García López"`
	ProxyDni        string     `json:"proxy_dni" binding:"omitempty,min=5,max=30" example:"12345678"`
	ProxyEmail      string     `json:"proxy_email" binding:"omitempty,email,max=255" example:"maria@email.com"`
	ProxyPhone      string     `json:"proxy_phone" binding:"omitempty,max=20" example:"+57 300 123 4567"`
	ProxyAddress    string     `json:"proxy_address" binding:"omitempty,max=500" example:"Calle 123 #45-67"`
	ProxyType       string     `json:"proxy_type" binding:"omitempty,oneof=external resident family" example:"external"`
	IsActive        *bool      `json:"is_active,omitempty" example:"true"`
	StartDate       *time.Time `json:"start_date,omitempty" example:"2025-01-15T00:00:00Z"`
	EndDate         *time.Time `json:"end_date,omitempty" example:"2025-12-31T23:59:59Z"`
	PowerOfAttorney string     `json:"power_of_attorney" binding:"omitempty,max=1000" example:"Poder para representar en asambleas"`
	Notes           string     `json:"notes" binding:"omitempty,max=1000" example:"Notas adicionales"`
}

// MarkAttendanceRequest - Request para marcar asistencia
type MarkAttendanceRequest struct {
	AttendanceListID uint   `json:"attendance_list_id" binding:"required" example:"1"`
	PropertyUnitID   uint   `json:"property_unit_id" binding:"required" example:"123"`
	ResidentID       *uint  `json:"resident_id,omitempty" example:"456"`
	ProxyID          *uint  `json:"proxy_id,omitempty" example:"789"`
	AttendedAsOwner  bool   `json:"attended_as_owner" example:"true"`
	AttendedAsProxy  bool   `json:"attended_as_proxy" example:"false"`
	Signature        string `json:"signature" binding:"omitempty,max=500" example:"Firma digital"`
	SignatureMethod  string `json:"signature_method" binding:"omitempty,oneof=digital handwritten electronic" example:"digital"`
	Notes            string `json:"notes" binding:"omitempty,max=1000" example:"Notas adicionales"`
}

// VerifyAttendanceRequest - Request para verificar asistencia
type VerifyAttendanceRequest struct {
	VerifiedBy        uint   `json:"verified_by" binding:"required" example:"5"`
	VerificationNotes string `json:"verification_notes" binding:"omitempty,max=500" example:"Verificado por administrador"`
}
