package domain

import (
	"time"
)

// ═══════════════════════════════════════════════════════════════════
//
//	HORIZONTAL PROPERTY DTOs - See horizontal_property_dtos.go
//
// ═══════════════════════════════════════════════════════════════════

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
	AllowEmptyDni    bool
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
