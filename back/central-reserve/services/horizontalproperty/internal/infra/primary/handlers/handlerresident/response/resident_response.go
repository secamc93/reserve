package response

import "time"

type SuccessResponse[T any] struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    T      `json:"data"`
}

type ErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Error   string `json:"error"`
}

type ResidentResponse struct {
	ID                 uint       `json:"id" example:"1"`
	BusinessID         uint       `json:"business_id" example:"1"`
	PropertyUnitID     uint       `json:"property_unit_id" example:"1"`
	PropertyUnitNumber string     `json:"property_unit_number" example:"101"`
	ResidentTypeID     uint       `json:"resident_type_id" example:"1"`
	ResidentTypeName   string     `json:"resident_type_name" example:"Propietario"`
	ResidentTypeCode   string     `json:"resident_type_code" example:"owner"`
	Name               string     `json:"name" example:"Juan Pérez"`
	Email              string     `json:"email" example:"juan@email.com"`
	Phone              string     `json:"phone" example:"+573001234567"`
	Dni                string     `json:"dni" example:"123456789"`
	EmergencyContact   string     `json:"emergency_contact" example:"María Pérez - 3009876543"`
	IsMainResident     bool       `json:"is_main_resident" example:"true"`
	IsActive           bool       `json:"is_active" example:"true"`
	MoveInDate         *time.Time `json:"move_in_date,omitempty" example:"2024-01-15T00:00:00Z"`
	MoveOutDate        *time.Time `json:"move_out_date,omitempty" example:"2025-01-15T00:00:00Z"`
	LeaseStartDate     *time.Time `json:"lease_start_date,omitempty" example:"2024-01-01T00:00:00Z"`
	LeaseEndDate       *time.Time `json:"lease_end_date,omitempty" example:"2024-12-31T23:59:59Z"`
	MonthlyRent        *float64   `json:"monthly_rent,omitempty" example:"1500000"`
	CreatedAt          time.Time  `json:"created_at" example:"2025-01-15T10:30:00Z"`
	UpdatedAt          time.Time  `json:"updated_at" example:"2025-01-15T10:30:00Z"`
}

type ResidentListItemResponse struct {
	ID                 uint   `json:"id" example:"1"`
	PropertyUnitNumber string `json:"property_unit_number" example:"101"`
	ResidentTypeName   string `json:"resident_type_name" example:"Propietario"`
	Name               string `json:"name" example:"Juan Pérez"`
	Email              string `json:"email" example:"juan@email.com"`
	Phone              string `json:"phone" example:"+573001234567"`
	IsMainResident     bool   `json:"is_main_resident" example:"true"`
	IsActive           bool   `json:"is_active" example:"true"`
}

type PaginatedResidentsResponse struct {
	Residents  []ResidentListItemResponse `json:"residents"`
	Total      int64                      `json:"total" example:"100"`
	Page       int                        `json:"page" example:"1"`
	PageSize   int                        `json:"page_size" example:"10"`
	TotalPages int                        `json:"total_pages" example:"10"`
}

type ResidentSuccess = SuccessResponse[ResidentResponse]
type ResidentsSuccess = SuccessResponse[PaginatedResidentsResponse]
