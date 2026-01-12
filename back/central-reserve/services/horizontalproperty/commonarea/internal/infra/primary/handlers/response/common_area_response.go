package response

import "time"

// CommonAreaResponse - Response de zona común
type CommonAreaResponse struct {
	ID                   uint      `json:"id"`
	BusinessID           uint      `json:"business_id"`
	CommonAreaTypeID     uint      `json:"common_area_type_id"`
	Name                 string    `json:"name"`
	Description          string    `json:"description"`
	Location             string    `json:"location"`
	MaxCapacity          int       `json:"max_capacity"`
	AreaSqm              *float64  `json:"area_sqm"`
	HasEquipment         bool      `json:"has_equipment"`
	EquipmentDescription string    `json:"equipment_description"`
	HourlyRate           *float64  `json:"hourly_rate"`
	RequiresApproval     bool      `json:"requires_approval"`
	RequiresDeposit      bool      `json:"requires_deposit"`
	DepositAmount        *float64  `json:"deposit_amount"`
	AllowsRecurring      bool      `json:"allows_recurring"`
	IsActive             bool      `json:"is_active"`
	ImageURLs            string    `json:"image_urls"`
	CreatedAt            time.Time `json:"created_at"`
	UpdatedAt            time.Time `json:"updated_at"`
}

// CommonAreaListResponse - Response de lista de zonas comunes
type CommonAreaListResponse struct {
	ID               uint   `json:"id"`
	Name             string `json:"name"`
	TypeName         string `json:"type_name"`
	Location         string `json:"location"`
	MaxCapacity      int    `json:"max_capacity"`
	IsActive         bool   `json:"is_active"`
	RequiresApproval bool   `json:"requires_approval"`
}

// CommonAreaTypeResponse - Response de tipo de zona comun
type CommonAreaTypeResponse struct {
	ID                 uint   `json:"id"`
	Name               string `json:"name"`
	Code               string `json:"code"`
	Description        string `json:"description"`
	Icon               string `json:"icon"`
	DefaultMaxCapacity *int   `json:"default_max_capacity"`
	RequiresApproval   bool   `json:"requires_approval"`
	AllowsRecurring    bool   `json:"allows_recurring"`
	IsActive           bool   `json:"is_active"`
}

// CommonAreaTypesResponse - Response de lista de tipos de zonas comunes
type CommonAreaTypesResponse struct {
	Success bool                     `json:"success"`
	Data    []CommonAreaTypeResponse `json:"data"`
}

// PaginatedCommonAreasResponse - Response paginado de zonas comunes
type PaginatedCommonAreasResponse struct {
	Success    bool                     `json:"success"`
	Data       []CommonAreaListResponse `json:"data"`
	Total      int64                    `json:"total"`
	Page       int                      `json:"page"`
	PageSize   int                      `json:"page_size"`
	TotalPages int                      `json:"total_pages"`
}

// ReservationResponse - Response de reserva
type ReservationResponse struct {
	ID                  uint      `json:"id"`
	BusinessID          uint      `json:"business_id"`
	CommonAreaID        uint      `json:"common_area_id"`
	CommonAreaName      string    `json:"common_area_name"`
	PropertyUnitID      uint      `json:"property_unit_id"`
	PropertyUnitNumber  string    `json:"property_unit_number"`
	ResidentID          *uint     `json:"resident_id"`
	ResidentName        string    `json:"resident_name"`
	ReservationStatusID uint      `json:"reservation_status_id"`
	StatusName          string    `json:"status_name"`
	ReservationDate     time.Time `json:"reservation_date"`
	StartTime           string    `json:"start_time"`
	EndTime             string    `json:"end_time"`
	DurationHours       float64   `json:"duration_hours"`
	NumberOfGuests      int       `json:"number_of_guests"`
	Purpose             string    `json:"purpose"`
	QRCode              string    `json:"qr_code"`
	AccessCode          string    `json:"access_code"`
	CreatedAt           time.Time `json:"created_at"`
}

// ReservationListResponse - Response de lista de reservas
type ReservationListResponse struct {
	ID                 uint      `json:"id"`
	CommonAreaName     string    `json:"common_area_name"`
	PropertyUnitNumber string    `json:"property_unit_number"`
	ResidentName       string    `json:"resident_name"`
	StatusName         string    `json:"status_name"`
	ReservationDate    time.Time `json:"reservation_date"`
	StartTime          string    `json:"start_time"`
	EndTime            string    `json:"end_time"`
	NumberOfGuests     int       `json:"number_of_guests"`
	CreatedAt          time.Time `json:"created_at"`
}

// PaginatedReservationsResponse - Response paginado de reservas
type PaginatedReservationsResponse struct {
	Success    bool                      `json:"success"`
	Data       []ReservationListResponse `json:"data"`
	Total      int64                     `json:"total"`
	Page       int                       `json:"page"`
	PageSize   int                       `json:"page_size"`
	TotalPages int                       `json:"total_pages"`
}

// CheckAvailabilityResponse - Response de verificación de disponibilidad
type CheckAvailabilityResponse struct {
	Success   bool   `json:"success"`
	Available bool   `json:"available"`
	Message   string `json:"message,omitempty"`
}

// SuccessResponse - Response genérico de éxito
type SuccessResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// ErrorResponse - Response de error
type ErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Error   string `json:"error,omitempty"`
}
