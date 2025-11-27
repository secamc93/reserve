package domain

import "time"

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
