package request

import "time"

// CreateCommonAreaRequest - Request para crear zona común
type CreateCommonAreaRequest struct {
	CommonAreaTypeID     uint     `json:"common_area_type_id" binding:"required"`
	Name                 string   `json:"name" binding:"required"`
	Description          string   `json:"description"`
	Location             string   `json:"location"`
	MaxCapacity          int      `json:"max_capacity" binding:"required,min=1"`
	AreaSqm              *float64 `json:"area_sqm"`
	HasEquipment         bool     `json:"has_equipment"`
	EquipmentDescription string   `json:"equipment_description"`
	HourlyRate           *float64 `json:"hourly_rate"`
	RequiresApproval     bool     `json:"requires_approval"`
	RequiresDeposit      bool     `json:"requires_deposit"`
	DepositAmount        *float64 `json:"deposit_amount"`
	AllowsRecurring      bool     `json:"allows_recurring"`
	ImageURLs            string   `json:"image_urls"`
}

// ListCommonAreasRequest - Request para listar zonas comunes
type ListCommonAreasRequest struct {
	CommonAreaTypeID *uint  `form:"common_area_type_id"`
	IsActive         *bool  `form:"is_active"`
	Search           string `form:"search"`
	Page             int    `form:"page,default=1"`
	PageSize         int    `form:"page_size,default=10"`
}

// CreateReservationRequest - Request para crear reserva
type CreateReservationRequest struct {
	CommonAreaID    uint      `json:"common_area_id" binding:"required"`
	PropertyUnitID  uint      `json:"property_unit_id" binding:"required"`
	ResidentID      *uint     `json:"resident_id"`
	ReservationDate time.Time `json:"reservation_date" binding:"required"`
	StartTime       string    `json:"start_time" binding:"required"`
	EndTime         string    `json:"end_time" binding:"required"`
	NumberOfGuests  int       `json:"number_of_guests" binding:"min=1"`
	Purpose         string    `json:"purpose"`
	SpecialRequests string    `json:"special_requests"`
	IsRecurring     bool      `json:"is_recurring"`
}

// CheckAvailabilityRequest - Request para verificar disponibilidad
type CheckAvailabilityRequest struct {
	CommonAreaID    uint      `json:"common_area_id" binding:"required"`
	ReservationDate time.Time `json:"reservation_date" binding:"required"`
	StartTime       string    `json:"start_time" binding:"required"`
	EndTime         string    `json:"end_time" binding:"required"`
}

// ListReservationsRequest - Request para listar reservas
type ListReservationsRequest struct {
	CommonAreaID        *uint      `form:"common_area_id"`
	PropertyUnitID      *uint      `form:"property_unit_id"`
	ResidentID          *uint      `form:"resident_id"`
	ReservationStatusID *uint      `form:"reservation_status_id"`
	Status              string     `form:"status"` // códigos separados por coma: pending,approved
	StartDate           *time.Time `form:"start_date"`
	EndDate             *time.Time `form:"end_date"`
	Page                int        `form:"page,default=1"`
	PageSize            int        `form:"page_size,default=10"`
}

// ApproveReservationRequest - Request para aprobar reserva
type ApproveReservationRequest struct {
	// No requiere campos adicionales, solo el ID en la URL
}

// RejectReservationRequest - Request para rechazar reserva
type RejectReservationRequest struct {
	Reason string `json:"reason" binding:"required"`
}

// CancelReservationRequest - Request para cancelar reserva
type CancelReservationRequest struct {
	Reason string `json:"reason"`
}

// UpdateCommonAreaRequest - Request para editar zona común
type UpdateCommonAreaRequest struct {
	CommonAreaTypeID     uint     `json:"common_area_type_id" binding:"required"`
	Name                 string   `json:"name" binding:"required"`
	Description          string   `json:"description"`
	Location             string   `json:"location"`
	MaxCapacity          int      `json:"max_capacity" binding:"required,min=1"`
	AreaSqm              *float64 `json:"area_sqm"`
	HasEquipment         bool     `json:"has_equipment"`
	EquipmentDescription string   `json:"equipment_description"`
	HourlyRate           *float64 `json:"hourly_rate"`
	RequiresApproval     bool     `json:"requires_approval"`
	RequiresDeposit      bool     `json:"requires_deposit"`
	DepositAmount        *float64 `json:"deposit_amount"`
	AllowsRecurring      bool     `json:"allows_recurring"`
	IsActive             *bool    `json:"is_active"`
	ImageURLs            string   `json:"image_urls"`
}

// ScheduleItemRequest - Horario de un día (0=domingo … 6=sábado)
type ScheduleItemRequest struct {
	DayOfWeek int    `json:"day_of_week" binding:"min=0,max=6"`
	StartTime string `json:"start_time" binding:"required"`
	EndTime   string `json:"end_time" binding:"required"`
	IsActive  bool   `json:"is_active"`
}

// SetSchedulesRequest - Request para guardar el horario semanal
type SetSchedulesRequest struct {
	Schedules []ScheduleItemRequest `json:"schedules" binding:"required,max=7,dive"`
}

// CreateRestrictionRequest - Request para bloquear una zona
type CreateRestrictionRequest struct {
	RestrictionType string  `json:"restriction_type" binding:"required"`
	StartDate       string  `json:"start_date" binding:"required"` // YYYY-MM-DD
	EndDate         string  `json:"end_date" binding:"required"`   // YYYY-MM-DD
	StartTime       *string `json:"start_time"`
	EndTime         *string `json:"end_time"`
	Reason          string  `json:"reason"`
}

// UpdatePaymentsRequest - Request para marcar pagos de una reserva
type UpdatePaymentsRequest struct {
	DepositPaid     *bool `json:"deposit_paid"`
	FullPaymentPaid *bool `json:"full_payment_paid"`
}

// SearchUnitsRequest - Request del buscador de unidades
type SearchUnitsRequest struct {
	Search string `form:"search"`
	Limit  int    `form:"limit"`
}
