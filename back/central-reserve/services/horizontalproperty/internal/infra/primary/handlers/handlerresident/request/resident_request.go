package request

import "time"

type CreateResidentRequest struct {
	PropertyUnitID   uint       `json:"property_unit_id" binding:"required" example:"1"`
	ResidentTypeID   uint       `json:"resident_type_id" binding:"required" example:"1"`
	Name             string     `json:"name" binding:"required" example:"Juan Pérez"`
	Email            string     `json:"email" binding:"required,email" example:"juan@email.com"`
	Phone            string     `json:"phone" example:"+573001234567"`
	Dni              string     `json:"dni" binding:"required" example:"123456789"`
	EmergencyContact string     `json:"emergency_contact" example:"María Pérez - 3009876543"`
	IsMainResident   bool       `json:"is_main_resident" example:"true"`
	MoveInDate       *time.Time `json:"move_in_date" example:"2024-01-15T00:00:00Z"`
	LeaseStartDate   *time.Time `json:"lease_start_date" example:"2024-01-01T00:00:00Z"`
	LeaseEndDate     *time.Time `json:"lease_end_date" example:"2024-12-31T23:59:59Z"`
	MonthlyRent      *float64   `json:"monthly_rent" example:"1500000"`
}

type UpdateResidentRequest struct {
	PropertyUnitID   *uint      `json:"property_unit_id" example:"1"`
	ResidentTypeID   *uint      `json:"resident_type_id" example:"1"`
	Name             *string    `json:"name" example:"Juan Pérez"`
	Email            *string    `json:"email" example:"juan@email.com"`
	Phone            *string    `json:"phone" example:"+573001234567"`
	Dni              *string    `json:"dni" example:"123456789"`
	EmergencyContact *string    `json:"emergency_contact" example:"María Pérez - 3009876543"`
	IsMainResident   *bool      `json:"is_main_resident" example:"true"`
	IsActive         *bool      `json:"is_active" example:"true"`
	MoveInDate       *time.Time `json:"move_in_date" example:"2024-01-15T00:00:00Z"`
	MoveOutDate      *time.Time `json:"move_out_date" example:"2025-01-15T00:00:00Z"`
	LeaseStartDate   *time.Time `json:"lease_start_date" example:"2024-01-01T00:00:00Z"`
	LeaseEndDate     *time.Time `json:"lease_end_date" example:"2024-12-31T23:59:59Z"`
	MonthlyRent      *float64   `json:"monthly_rent" example:"1500000"`
}

// BulkUpdateResidentItemRequest - Request para un residente en edición masiva
type BulkUpdateResidentItemRequest struct {
	PropertyUnitNumber string  `json:"property_unit_number" binding:"required" example:"101" description:"Número de unidad (columna principal para identificar el residente)"`
	Name               *string `json:"name,omitempty" example:"Juan Pérez" description:"Nombre del residente (opcional)"`
	Dni                *string `json:"dni,omitempty" example:"12345678" description:"DNI del residente (opcional)"`
}

// BulkUpdateResidentsRequest - Request para edición masiva de residentes
type BulkUpdateResidentsRequest struct {
	Residents []BulkUpdateResidentItemRequest `json:"residents" binding:"required,min=1" description:"Lista de residentes a actualizar"`
}

type ResidentFiltersRequest struct {
	PropertyUnitNumber string `form:"property_unit_number" example:"101"`
	Name               string `form:"name" example:"Juan"`
	PropertyUnitID     *uint  `form:"property_unit_id" example:"1"`
	ResidentTypeID     *uint  `form:"resident_type_id" example:"1"`
	IsActive           *bool  `form:"is_active" example:"true"`
	IsMainResident     *bool  `form:"is_main_resident" example:"true"`
	Page               int    `form:"page" example:"1"`
	PageSize           int    `form:"page_size" example:"10"`
}
