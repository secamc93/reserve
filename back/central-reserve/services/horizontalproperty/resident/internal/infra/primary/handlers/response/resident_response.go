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
	ID                 uint       `json:"id" example:"1"`
	PropertyUnitNumber string     `json:"property_unit_number" example:"101"`
	PropertyUnitBlock  string     `json:"property_unit_block" example:"Casa"`
	Dni                string     `json:"dni" example:"12345678"`
	Since              *time.Time `json:"since,omitempty" example:"2021-03-01T00:00:00Z"`
	ResidentTypeName   string     `json:"resident_type_name" example:"Propietario"`
	Name               string     `json:"name" example:"Juan Pérez"`
	Email              string     `json:"email" example:"juan@email.com"`
	Phone              string     `json:"phone" example:"+573001234567"`
	IsMainResident     bool       `json:"is_main_resident" example:"true"`
	IsActive           bool       `json:"is_active" example:"true"`
}

type PaginatedResidentsResponse struct {
	Residents  []ResidentListItemResponse `json:"residents"`
	Total      int64                      `json:"total" example:"100"`
	Page       int                        `json:"page" example:"1"`
	PageSize   int                        `json:"page_size" example:"10"`
	TotalPages int                        `json:"total_pages" example:"10"`
}

// BulkUpdateResidentsResponse - Response para edición masiva de residentes
type BulkUpdateResidentsResponse struct {
	TotalProcessed int                           `json:"total_processed" example:"10" description:"Total de residentes procesados"`
	Updated        int                           `json:"updated" example:"8" description:"Residentes actualizados exitosamente"`
	Errors         int                           `json:"errors" example:"2" description:"Residentes con errores"`
	ErrorDetails   []BulkUpdateErrorDetailResult `json:"error_details,omitempty" description:"Detalles de errores específicos"`
}

// BulkUpdateErrorDetailResult - estructura de error para frontend
type BulkUpdateErrorDetailResult struct {
	Row                int    `json:"row" example:"4"`
	PropertyUnitNumber string `json:"property_unit_number" example:"101A"`
	Error              string `json:"error" example:"Unidad no encontrada"`
}

type ResidentSuccess = SuccessResponse[ResidentResponse]
type ResidentsSuccess = SuccessResponse[PaginatedResidentsResponse]
type BulkUpdateResidentsSuccess = SuccessResponse[BulkUpdateResidentsResponse]

type ResidentTypeCountResponse struct {
	ResidentTypeID uint   `json:"resident_type_id" example:"1"`
	Name           string `json:"name" example:"Propietario"`
	Code           string `json:"code" example:"owner"`
	Total          int64  `json:"total" example:"120"`
}

type ResidentsSummaryResponse struct {
	Total        int64                       `json:"total" example:"194"`
	Active       int64                       `json:"active" example:"190"`
	Inactive     int64                       `json:"inactive" example:"4"`
	Main         int64                       `json:"main" example:"180"`
	WithoutEmail int64                       `json:"without_email" example:"20"`
	Types        []ResidentTypeCountResponse `json:"types"`
}

type ResidentsSummarySuccess struct {
	Success bool                     `json:"success"`
	Message string                   `json:"message"`
	Data    ResidentsSummaryResponse `json:"data"`
}

type ResidentOverviewStatsResponse struct {
	Visits30d       int64 `json:"visits_30d" example:"3"`
	PackagesPending int64 `json:"packages_pending" example:"1"`
	Reservations    int64 `json:"reservations" example:"0"`
	VotesCast       int64 `json:"votes_cast" example:"4"`
	VotesTotal      int64 `json:"votes_total" example:"4"`
}

type HousemateResponse struct {
	ID       uint   `json:"id" example:"2"`
	Name     string `json:"name" example:"Luis Pérez"`
	TypeName string `json:"type_name" example:"Familiar"`
	IsMain   bool   `json:"is_main" example:"false"`
}

type ActivityResponse struct {
	Kind     string    `json:"kind" example:"package"`
	Title    string    `json:"title" example:"Paquete recibido"`
	Subtitle string    `json:"subtitle" example:"Servientrega"`
	At       time.Time `json:"at" example:"2026-10-10T15:00:00Z"`
}

type ResidentOverviewResponse struct {
	Stats      ResidentOverviewStatsResponse `json:"stats"`
	Housemates []HousemateResponse           `json:"housemates"`
	Activity   []ActivityResponse            `json:"activity"`
}

type ResidentOverviewSuccess struct {
	Success bool                     `json:"success"`
	Message string                   `json:"message"`
	Data    ResidentOverviewResponse `json:"data"`
}
