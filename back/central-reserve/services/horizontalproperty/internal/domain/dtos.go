package domain

import (
	"mime/multipart"
	"time"
)

// ═══════════════════════════════════════════════════════════════════
//
//	HORIZONTAL PROPERTY DTOs
//
// ═══════════════════════════════════════════════════════════════════

// CreateHorizontalPropertyDTO - DTO para crear una propiedad horizontal
type CreateHorizontalPropertyDTO struct {
	Name             string
	Code             string
	ParentBusinessID *uint
	Timezone         string
	Address          string
	Description      string

	// Configuración de marca blanca - Archivos para S3
	LogoFile        *multipart.FileHeader
	NavbarImageFile *multipart.FileHeader

	PrimaryColor    string
	SecondaryColor  string
	TertiaryColor   string
	QuaternaryColor string
	CustomDomain    string

	// Configuración específica para propiedades horizontales
	TotalUnits    int
	TotalFloors   *int
	HasElevator   bool
	HasParking    bool
	HasPool       bool
	HasGym        bool
	HasSocialArea bool

	// Opciones de configuración inicial automática
	SetupOptions *HorizontalPropertySetupOptions
}

// HorizontalPropertySetupOptions - Opciones para configuración inicial automática
type HorizontalPropertySetupOptions struct {
	CreateUnits              bool
	UnitPrefix               string
	UnitType                 string
	UnitsPerFloor            *int
	StartUnitNumber          int
	CreateRequiredCommittees bool
}

// UpdateHorizontalPropertyDTO - DTO para actualizar una propiedad horizontal
type UpdateHorizontalPropertyDTO struct {
	Name             *string
	Code             *string
	ParentBusinessID *uint
	Timezone         *string
	Address          *string
	Description      *string

	// Configuración de marca blanca
	LogoFile        *multipart.FileHeader
	NavbarImageFile *multipart.FileHeader
	PrimaryColor    *string
	SecondaryColor  *string
	TertiaryColor   *string
	QuaternaryColor *string
	CustomDomain    *string

	// Configuración específica para propiedades horizontales
	TotalUnits    *int
	TotalFloors   *int
	HasElevator   *bool
	HasParking    *bool
	HasPool       *bool
	HasGym        *bool
	HasSocialArea *bool
	IsActive      *bool
}

// HorizontalPropertyDTO - DTO para respuesta de propiedad horizontal
type HorizontalPropertyDTO struct {
	ID               uint
	Name             string
	Code             string
	BusinessTypeID   uint
	BusinessTypeName string
	ParentBusinessID *uint
	Timezone         string
	Address          string
	Description      string

	// Configuración de marca blanca
	LogoURL         string
	PrimaryColor    string
	SecondaryColor  string
	TertiaryColor   string
	QuaternaryColor string
	NavbarImageURL  string
	CustomDomain    string

	// Configuración específica para propiedades horizontales
	TotalUnits    int
	TotalFloors   *int
	HasElevator   bool
	HasParking    bool
	HasPool       bool
	HasGym        bool
	HasSocialArea bool

	// Información detallada (solo en GET by ID)
	PropertyUnits []PropertyUnitDTO
	Committees    []CommitteeDTO

	IsActive  bool
	CreatedAt time.Time
	UpdatedAt time.Time
}

// PropertyUnitDTO - DTO para unidades de propiedad
type PropertyUnitDTO struct {
	ID          uint
	Number      string
	Floor       *int
	Block       string
	UnitType    string
	Area        *float64
	Bedrooms    *int
	Bathrooms   *int
	Description string
	IsActive    bool
}

// CommitteeDTO - DTO para comités
type CommitteeDTO struct {
	ID              uint
	CommitteeTypeID uint
	TypeName        string
	TypeCode        string
	Name            string
	StartDate       time.Time
	EndDate         *time.Time
	IsActive        bool
	Notes           string
}

// HorizontalPropertyListDTO - DTO para lista de propiedades horizontales
type HorizontalPropertyListDTO struct {
	ID               uint
	Name             string
	Code             string
	BusinessTypeName string
	Address          string
	TotalUnits       int
	LogoURL          string
	NavbarImageURL   string
	IsActive         bool
	CreatedAt        time.Time
}

// HorizontalPropertyFiltersDTO - DTO para filtros de búsqueda
type HorizontalPropertyFiltersDTO struct {
	Name       *string
	Code       *string
	IsActive   *bool
	BusinessID *uint
	Page       int
	PageSize   int
	OrderBy    string
	OrderDir   string
}

// PaginatedHorizontalPropertyDTO - DTO para respuesta paginada
type PaginatedHorizontalPropertyDTO struct {
	Data       []HorizontalPropertyListDTO
	Total      int64
	Page       int
	PageSize   int
	TotalPages int
}

// ═══════════════════════════════════════════════════════════════════
//
//  VOTING DTOs
//
// ═══════════════════════════════════════════════════════════════════

// CreateVotingGroupDTO - DTO para crear un grupo de votaciones
type CreateVotingGroupDTO struct {
	BusinessID       uint
	Name             string
	Description      string
	VotingStartDate  time.Time
	VotingEndDate    time.Time
	RequiresQuorum   bool
	QuorumPercentage *float64
	CreatedByUserID  *uint
	Notes            string
}

// VotingGroupDTO - DTO para respuesta de grupo de votaciones
type VotingGroupDTO struct {
	ID               uint
	BusinessID       uint
	Name             string
	Description      string
	VotingStartDate  time.Time
	VotingEndDate    time.Time
	IsActive         bool
	RequiresQuorum   bool
	QuorumPercentage *float64
	CreatedByUserID  *uint
	Notes            string
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

// CreateVotingDTO - DTO para crear una votación
type CreateVotingDTO struct {
	VotingGroupID      uint
	Title              string
	Description        string
	VotingType         string
	IsSecret           bool
	AllowAbstention    bool
	DisplayOrder       int
	RequiredPercentage *float64
}

// VotingDTO - DTO para respuesta de una votación
type VotingDTO struct {
	ID                 uint
	VotingGroupID      uint
	Title              string
	Description        string
	VotingType         string
	IsSecret           bool
	AllowAbstention    bool
	IsActive           bool
	DisplayOrder       int
	RequiredPercentage *float64
	CreatedAt          time.Time
	UpdatedAt          time.Time
	Options            []VotingOptionDTO
}

// CreateVotingOptionDTO - DTO para crear una opción de votación
type CreateVotingOptionDTO struct {
	VotingID     uint
	OptionText   string
	OptionCode   string
	Color        string
	DisplayOrder int
}

// VotingOptionDTO - DTO para respuesta de opción de votación
type VotingOptionDTO struct {
	ID           uint
	VotingID     uint
	OptionText   string
	OptionCode   string
	Color        string
	DisplayOrder int
	IsActive     bool
}

// CreateVoteDTO - DTO para emitir un voto
type CreateVoteDTO struct {
	VotingID       uint
	PropertyUnitID uint
	VotingOptionID uint
	IPAddress      string
	UserAgent      string
	Notes          string
}

// VoteDTO - DTO para respuesta de voto
type VoteDTO struct {
	ID             uint
	VotingID       uint
	PropertyUnitID uint
	VotingOptionID uint
	OptionText     string
	OptionCode     string
	OptionColor    string
	VotedAt        time.Time
	IPAddress      string
	UserAgent      string
	Notes          string
}

// VotingResultDTO - DTO para resultados de votación
type VotingResultDTO struct {
	VotingOptionID uint
	OptionText     string
	OptionCode     string
	Color          string
	VoteCount      int
	Percentage     float64
}

// VotingDetailByUnitDTO - DTO para detalle de votación por unidad
type VotingDetailByUnitDTO struct {
	PropertyUnitID           uint
	PropertyUnitNumber       string
	ParticipationCoefficient *float64
	ResidentID               *uint
	ResidentName             *string
	HasVoted                 bool
	VotingOptionID           *uint
	OptionText               *string
	OptionCode               *string
	OptionColor              *string
	VotedAt                  *string
}

// UnitWithResidentDTO - DTO simple para unidad con su residente principal
type UnitWithResidentDTO struct {
	PropertyUnitID     uint
	PropertyUnitNumber string
	ResidentID         *uint
	ResidentName       *string
}

// ───────────────────────────────────────────
// PROPERTY UNIT DTOs
// ───────────────────────────────────────────

// CreatePropertyUnitDTO - DTO para crear unidad de propiedad
type CreatePropertyUnitDTO struct {
	BusinessID               uint
	Number                   string
	Floor                    *int
	Block                    string
	UnitType                 string
	Area                     *float64
	Bedrooms                 *int
	Bathrooms                *int
	ParticipationCoefficient *float64
	Description              string
}

// UpdatePropertyUnitDTO - DTO para actualizar unidad de propiedad
type UpdatePropertyUnitDTO struct {
	Number                   *string
	Floor                    *int
	Block                    *string
	UnitType                 *string
	Area                     *float64
	Bedrooms                 *int
	Bathrooms                *int
	ParticipationCoefficient *float64
	Description              *string
	IsActive                 *bool
}

// PropertyUnitDetailDTO - DTO para respuesta detallada de unidad
type PropertyUnitDetailDTO struct {
	ID                       uint
	BusinessID               uint
	Number                   string
	Floor                    *int
	Block                    string
	UnitType                 string
	Area                     *float64
	Bedrooms                 *int
	Bathrooms                *int
	ParticipationCoefficient *float64
	Description              string
	IsActive                 bool
	CreatedAt                time.Time
	UpdatedAt                time.Time
}

// PropertyUnitListDTO - DTO para listado de unidades
type PropertyUnitListDTO struct {
	ID                       uint
	Number                   string
	Floor                    *int
	Block                    string
	UnitType                 string
	Area                     *float64
	Bedrooms                 *int
	Bathrooms                *int
	ParticipationCoefficient *float64
	IsActive                 bool
}

// PropertyUnitFiltersDTO - DTO para filtros de búsqueda
type PropertyUnitFiltersDTO struct {
	BusinessID uint
	Number     string
	UnitType   string
	Floor      *int
	Block      string
	IsActive   *bool
	Page       int
	PageSize   int
}

// PaginatedPropertyUnitsDTO - DTO para respuesta paginada
type PaginatedPropertyUnitsDTO struct {
	Units      []PropertyUnitListDTO
	Total      int64
	Page       int
	PageSize   int
	TotalPages int
}

// ImportPropertyUnitsResult - Resultado de la importación de unidades
type ImportPropertyUnitsResult struct {
	Total   int
	Created int
	Skipped int
	Errors  []string
}

// ───────────────────────────────────────────
// RESIDENT DTOs
// ───────────────────────────────────────────

// ImportResidentsResult - Resultado de la importación de residentes
type ImportResidentsResult struct {
	Total   int
	Created int
	Errors  []string
}

// ResidentBasicDTO - DTO básico de residente para validación pública
type ResidentBasicDTO struct {
	ID                 uint
	Name               string
	PropertyUnitID     uint
	PropertyUnitNumber string
}

// CreateResidentDTO - DTO para crear residente
type CreateResidentDTO struct {
	BusinessID       uint
	PropertyUnitID   uint
	ResidentTypeID   uint
	Name             string
	Email            string
	Phone            string
	Dni              string
	EmergencyContact string
	IsMainResident   bool
	MoveInDate       *time.Time
	LeaseStartDate   *time.Time
	LeaseEndDate     *time.Time
	MonthlyRent      *float64
}

// UpdateResidentDTO - DTO para actualizar residente
type UpdateResidentDTO struct {
	PropertyUnitID   *uint
	ResidentTypeID   *uint
	Name             *string
	Email            *string
	Phone            *string
	Dni              *string
	EmergencyContact *string
	IsMainResident   *bool
	IsActive         *bool
	MoveInDate       *time.Time
	MoveOutDate      *time.Time
	LeaseStartDate   *time.Time
	LeaseEndDate     *time.Time
	MonthlyRent      *float64
}

// ResidentDetailDTO - DTO para respuesta detallada de residente
type ResidentDetailDTO struct {
	ID                 uint
	BusinessID         uint
	PropertyUnitID     uint
	PropertyUnitNumber string
	ResidentTypeID     uint
	ResidentTypeName   string
	ResidentTypeCode   string
	Name               string
	Email              string
	Phone              string
	Dni                string
	EmergencyContact   string
	IsMainResident     bool
	IsActive           bool
	MoveInDate         *time.Time
	MoveOutDate        *time.Time
	LeaseStartDate     *time.Time
	LeaseEndDate       *time.Time
	MonthlyRent        *float64
	CreatedAt          time.Time
	UpdatedAt          time.Time
}

// ResidentListDTO - DTO para listado de residentes
type ResidentListDTO struct {
	ID                 uint
	PropertyUnitNumber string
	ResidentTypeName   string
	Name               string
	Email              string
	Phone              string
	IsMainResident     bool
	IsActive           bool
}

// ResidentFiltersDTO - DTO para filtros de búsqueda
type ResidentFiltersDTO struct {
	BusinessID         uint
	PropertyUnitNumber string
	Name               string
	Dni                string
	PropertyUnitID     *uint
	ResidentTypeID     *uint
	IsActive           *bool
	IsMainResident     *bool
	Page               int
	PageSize           int
}

// PaginatedResidentsDTO - DTO para respuesta paginada
type PaginatedResidentsDTO struct {
	Residents  []ResidentListDTO
	Total      int64
	Page       int
	PageSize   int
	TotalPages int
}

// BulkUpdateResidentItem - DTO para un residente en edición masiva

// BulkUpdateResidentItem - DTO para un residente en edición masiva
type BulkUpdateResidentItem struct {
	PropertyUnitNumber string  `json:"property_unit_number" binding:"required" example:"101" description:"Número de unidad (columna principal para identificar el residente)"`
	Name               *string `json:"name,omitempty" example:"Juan Pérez" description:"Nombre del residente (opcional)"`
	Dni                *string `json:"dni,omitempty" example:"12345678" description:"DNI del residente (opcional)"`
}

// BulkUpdateResidentsRequest - DTO para solicitud de edición masiva
type BulkUpdateResidentsRequest struct {
	Residents []BulkUpdateResidentItem `json:"residents" binding:"required,min=1" description:"Lista de residentes a actualizar"`
}

// BulkUpdateResidentsResult - DTO para resultado de edición masiva
type BulkUpdateResidentsResult struct {
	TotalProcessed int                     `json:"total_processed" example:"10" description:"Total de residentes procesados"`
	Updated        int                     `json:"updated" example:"8" description:"Residentes actualizados exitosamente"`
	Errors         int                     `json:"errors" example:"2" description:"Residentes con errores"`
	ErrorDetails   []BulkUpdateErrorDetail `json:"error_details,omitempty" description:"Detalles de errores específicos"`
}

// BulkUpdateErrorDetail detalla un error por fila/unidad para graficar en frontend
type BulkUpdateErrorDetail struct {
	Row                int    `json:"row" example:"4" description:"Número de fila en el Excel (1-based incluyendo encabezado)"`
	PropertyUnitNumber string `json:"property_unit_number" example:"101A" description:"Número de unidad asociado al error"`
	Error              string `json:"error" example:"Unidad no encontrada" description:"Mensaje claro del error"`
}

// ResidentUpdatePair representa una actualización a aplicar en batch
type ResidentUpdatePair struct {
	ID        uint              `json:"id"`
	UpdateDTO UpdateResidentDTO `json:"update"`
}

// UnvotedUnitDTO - DTO para unidades que no han votado
type UnvotedUnitDTO struct {
	UnitID       uint   `json:"unit_id" example:"123"`
	UnitNumber   string `json:"unit_number" example:"Apto 101"`
	ResidentID   uint   `json:"resident_id" example:"456"`
	ResidentName string `json:"resident_name" example:"Juan Pérez"`
}

// ============================================================================
// ATTENDANCE DTOs - DTOs para gestión de asistencia
// ============================================================================

// CreateAttendanceListDTO - DTO para crear lista de asistencia
type CreateAttendanceListDTO struct {
	VotingGroupID   uint   `json:"voting_group_id" binding:"required" example:"1"`
	Title           string `json:"title" binding:"required,min=3,max=200" example:"Asistencia Asamblea Ordinaria 2024"`
	Description     string `json:"description" binding:"max=1000" example:"Lista de asistencia para la asamblea ordinaria"`
	CreatedByUserID *uint  `json:"created_by_user_id,omitempty" example:"5"`
	Notes           string `json:"notes" binding:"max=2000" example:"Notas adicionales"`
}

// UpdateAttendanceListDTO - DTO para actualizar lista de asistencia
type UpdateAttendanceListDTO struct {
	Title       string `json:"title" binding:"omitempty,min=3,max=200" example:"Asistencia Asamblea Ordinaria 2024 - Actualizada"`
	Description string `json:"description" binding:"omitempty,max=1000" example:"Lista actualizada"`
	IsActive    *bool  `json:"is_active,omitempty" example:"true"`
	Notes       string `json:"notes" binding:"omitempty,max=2000" example:"Notas actualizadas"`
}

// AttendanceListDTO - DTO para respuesta de lista de asistencia
type AttendanceListDTO struct {
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

// CreateProxyDTO - DTO para crear apoderado
type CreateProxyDTO struct {
	BusinessID      uint       `json:"business_id" binding:"required" example:"1"`
	PropertyUnitID  uint       `json:"property_unit_id" binding:"required" example:"123"`
	ProxyName       string     `json:"proxy_name" binding:"required,min=3,max=255" example:"María García López"`
	ProxyDni        string     `json:"proxy_dni" binding:"omitempty,min=5,max=30" example:"12345678"`
	ProxyEmail      string     `json:"proxy_email" binding:"omitempty,email,max=255" example:"maria@email.com"`
	ProxyPhone      string     `json:"proxy_phone" binding:"omitempty,max=20" example:"+57 300 123 4567"`
	ProxyAddress    string     `json:"proxy_address" binding:"omitempty,max=500" example:"Calle 123 #45-67"`
	ProxyType       string     `json:"proxy_type" binding:"omitempty,oneof=external resident family" example:"external"`
	StartDate       *time.Time `json:"start_date,omitempty" example:"2025-01-15T00:00:00Z"`
	EndDate         *time.Time `json:"end_date,omitempty" example:"2025-12-31T23:59:59Z"`
	PowerOfAttorney string     `json:"power_of_attorney" binding:"omitempty,max=1000" example:"Poder para representar en asambleas"`
	Notes           string     `json:"notes" binding:"omitempty,max=1000" example:"Notas adicionales"`
}

// UpdateProxyDTO - DTO para actualizar apoderado
type UpdateProxyDTO struct {
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

// ProxyDTO - DTO para respuesta de apoderado
type ProxyDTO struct {
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

// CreateAttendanceRecordDTO - DTO para crear registro de asistencia
type CreateAttendanceRecordDTO struct {
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

// UpdateAttendanceRecordDTO - DTO para actualizar registro de asistencia
type UpdateAttendanceRecordDTO struct {
	ResidentID        *uint  `json:"resident_id,omitempty" example:"456"`
	ProxyID           *uint  `json:"proxy_id,omitempty" example:"789"`
	AttendedAsOwner   *bool  `json:"attended_as_owner,omitempty" example:"true"`
	AttendedAsProxy   *bool  `json:"attended_as_proxy,omitempty" example:"false"`
	Signature         string `json:"signature" binding:"omitempty,max=500" example:"Firma digital"`
	SignatureMethod   string `json:"signature_method" binding:"omitempty,oneof=digital handwritten electronic" example:"digital"`
	VerifiedBy        *uint  `json:"verified_by,omitempty" example:"5"`
	VerificationNotes string `json:"verification_notes" binding:"omitempty,max=500" example:"Verificado por administrador"`
	Notes             string `json:"notes" binding:"omitempty,max=1000" example:"Notas adicionales"`
	IsValid           *bool  `json:"is_valid,omitempty" example:"true"`
}

// AttendanceRecordDTO - DTO para respuesta de registro de asistencia
type AttendanceRecordDTO struct {
	ID                       uint       `json:"id" example:"1"`
	AttendanceListID         uint       `json:"attendance_list_id" example:"1"`
	PropertyUnitID           uint       `json:"property_unit_id" example:"123"`
	ResidentID               *uint      `json:"resident_id,omitempty" example:"456"`
	ProxyID                  *uint      `json:"proxy_id,omitempty" example:"789"`
	AttendedAsOwner          bool       `json:"attended_as_owner" example:"true"`
	AttendedAsProxy          bool       `json:"attended_as_proxy" example:"false"`
	Signature                string     `json:"signature" example:"Firma digital"`
	SignatureDate            *time.Time `json:"signature_date,omitempty" example:"2025-01-15T14:30:00Z"`
	SignatureMethod          string     `json:"signature_method" example:"digital"`
	VerifiedBy               *uint      `json:"verified_by,omitempty" example:"5"`
	VerificationDate         *time.Time `json:"verification_date,omitempty" example:"2025-01-15T15:00:00Z"`
	VerificationNotes        string     `json:"verification_notes" example:"Verificado por administrador"`
	Notes                    string     `json:"notes" example:"Notas adicionales"`
	IsValid                  bool       `json:"is_valid" example:"true"`
	CreatedAt                time.Time  `json:"created_at" example:"2025-01-15T10:30:00Z"`
	UpdatedAt                time.Time  `json:"updated_at" example:"2025-01-15T10:30:00Z"`
	ResidentName             string     `json:"resident_name" example:"Juan Pérez"`
	ProxyName                string     `json:"proxy_name" example:"María García"`
	UnitNumber               string     `json:"unit_number" example:"CASA 126"`
	ParticipationCoefficient string     `json:"participation_coefficient" example:"0.005234"`
}

// AttendanceSummaryDTO - DTO para resumen de asistencia
type AttendanceSummaryDTO struct {
	TotalUnits           int     `json:"total_units" example:"100"`
	AttendedUnits        int     `json:"attended_units" example:"85"`
	AbsentUnits          int     `json:"absent_units" example:"15"`
	AttendedAsOwner      int     `json:"attended_as_owner" example:"70"`
	AttendedAsProxy      int     `json:"attended_as_proxy" example:"15"`
	AttendanceRate       float64 `json:"attendance_rate" example:"85.0"`
	AbsenceRate          float64 `json:"absence_rate" example:"15.0"`
	AttendanceRateByCoef float64 `json:"attendance_rate_by_coef" example:"85.0"`
	AbsenceRateByCoef    float64 `json:"absence_rate_by_coef" example:"15.0"`
}
