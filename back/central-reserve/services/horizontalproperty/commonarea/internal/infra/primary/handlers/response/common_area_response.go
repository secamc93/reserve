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
	TypeName             string    `json:"type_name"`
	TypeCode             string    `json:"type_code"`
	CreatedAt            time.Time `json:"created_at"`
	UpdatedAt            time.Time `json:"updated_at"`
}

// CommonAreaListResponse - Response de lista de zonas comunes
type CommonAreaListResponse struct {
	ID                   uint                  `json:"id"`
	Name                 string                `json:"name"`
	TypeName             string                `json:"type_name"`
	TypeCode             string                `json:"type_code"`
	Description          string                `json:"description"`
	Location             string                `json:"location"`
	MaxCapacity          int                   `json:"max_capacity"`
	AreaSqm              *float64              `json:"area_sqm"`
	HasEquipment         bool                  `json:"has_equipment"`
	EquipmentDescription string                `json:"equipment_description"`
	HourlyRate           *float64              `json:"hourly_rate"`
	RequiresDeposit      bool                  `json:"requires_deposit"`
	DepositAmount        *float64              `json:"deposit_amount"`
	AllowsRecurring      bool                  `json:"allows_recurring"`
	IsActive             bool                  `json:"is_active"`
	RequiresApproval     bool                  `json:"requires_approval"`
	ImageURLs            string                `json:"image_urls"`
	Schedules            []ScheduleResponse    `json:"schedules"`
	Restrictions         []RestrictionResponse `json:"restrictions"`
}

// ScheduleResponse - Horario de un día
type ScheduleResponse struct {
	ID        uint   `json:"id"`
	DayOfWeek int    `json:"day_of_week"`
	StartTime string `json:"start_time"`
	EndTime   string `json:"end_time"`
	IsActive  bool   `json:"is_active"`
}

// RestrictionResponse - Bloqueo de una zona
type RestrictionResponse struct {
	ID              uint    `json:"id"`
	CommonAreaID    uint    `json:"common_area_id"`
	RestrictionType string  `json:"restriction_type"`
	StartDate       string  `json:"start_date"`
	EndDate         string  `json:"end_date"`
	StartTime       *string `json:"start_time"`
	EndTime         *string `json:"end_time"`
	Reason          string  `json:"reason"`
	IsActive        bool    `json:"is_active"`
}

// UnitLookupResponse - Unidad del buscador
type UnitLookupResponse struct {
	ID     uint   `json:"id"`
	Number string `json:"number"`
	Block  string `json:"block"`
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
	ID                  uint       `json:"id"`
	BusinessID          uint       `json:"business_id"`
	CommonAreaID        uint       `json:"common_area_id"`
	CommonAreaName      string     `json:"common_area_name"`
	PropertyUnitID      uint       `json:"property_unit_id"`
	PropertyUnitNumber  string     `json:"property_unit_number"`
	PropertyUnitBlock   string     `json:"property_unit_block"`
	ResidentID          *uint      `json:"resident_id"`
	ResidentName        string     `json:"resident_name"`
	ReservationStatusID uint       `json:"reservation_status_id"`
	StatusCode          string     `json:"status_code"`
	StatusName          string     `json:"status_name"`
	ReservationDate     time.Time  `json:"reservation_date"`
	StartTime           string     `json:"start_time"`
	EndTime             string     `json:"end_time"`
	DurationHours       float64    `json:"duration_hours"`
	RequiresApproval    bool       `json:"requires_approval"`
	ApprovedAt          *time.Time `json:"approved_at"`
	RejectedAt          *time.Time `json:"rejected_at"`
	RejectionReason     string     `json:"rejection_reason"`
	NumberOfGuests      int        `json:"number_of_guests"`
	Purpose             string     `json:"purpose"`
	SpecialRequests     string     `json:"special_requests"`
	IsRecurring         bool       `json:"is_recurring"`
	TotalAmount         *float64   `json:"total_amount"`
	DepositAmount       *float64   `json:"deposit_amount"`
	DepositPaid         bool       `json:"deposit_paid"`
	DepositPaidAt       *time.Time `json:"deposit_paid_at"`
	FullPaymentPaid     bool       `json:"full_payment_paid"`
	FullPaymentPaidAt   *time.Time `json:"full_payment_paid_at"`
	QRCode              string     `json:"qr_code"`
	AccessCode          string     `json:"access_code"`
	CheckedInAt         *time.Time `json:"checked_in_at"`
	CheckedOutAt        *time.Time `json:"checked_out_at"`
	CancelledAt         *time.Time `json:"cancelled_at"`
	CancellationReason  string     `json:"cancellation_reason"`
	Notes               string     `json:"notes"`
	ResidentNotes       string     `json:"resident_notes"`
	CreatedAt           time.Time  `json:"created_at"`
	UpdatedAt           time.Time  `json:"updated_at"`
}

// ReservationListResponse - Response de lista de reservas
type ReservationListResponse struct {
	ID                 uint       `json:"id"`
	CommonAreaID       uint       `json:"common_area_id"`
	CommonAreaName     string     `json:"common_area_name"`
	PropertyUnitID     uint       `json:"property_unit_id"`
	PropertyUnitNumber string     `json:"property_unit_number"`
	PropertyUnitBlock  string     `json:"property_unit_block"`
	ResidentName       string     `json:"resident_name"`
	StatusCode         string     `json:"status_code"`
	StatusName         string     `json:"status_name"`
	ReservationDate    time.Time  `json:"reservation_date"`
	StartTime          string     `json:"start_time"`
	EndTime            string     `json:"end_time"`
	NumberOfGuests     int        `json:"number_of_guests"`
	Purpose            string     `json:"purpose"`
	RequiresApproval   bool       `json:"requires_approval"`
	TotalAmount        *float64   `json:"total_amount"`
	DepositAmount      *float64   `json:"deposit_amount"`
	DepositPaid        bool       `json:"deposit_paid"`
	FullPaymentPaid    bool       `json:"full_payment_paid"`
	CheckedInAt        *time.Time `json:"checked_in_at"`
	CreatedAt          time.Time  `json:"created_at"`
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
