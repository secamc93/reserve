package response

import "time"

// ParkingZoneResponse - Response de zona de parqueo
type ParkingZoneResponse struct {
	ID          uint      `json:"id"`
	BusinessID  uint      `json:"business_id"`
	Name        string    `json:"name"`
	Code        string    `json:"code"`
	Description string    `json:"description"`
	Location    string    `json:"location"`
	TotalSlots  int       `json:"total_slots"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ParkingZoneListResponse - Response de lista de zonas de parqueo
type ParkingZoneListResponse struct {
	ID         uint   `json:"id"`
	Name       string `json:"name"`
	Code       string `json:"code"`
	Location   string `json:"location"`
	TotalSlots int    `json:"total_slots"`
	IsActive   bool   `json:"is_active"`
}

// PaginatedParkingZonesResponse - Response paginado de zonas de parqueo
type PaginatedParkingZonesResponse struct {
	Success    bool                      `json:"success"`
	Data       []ParkingZoneListResponse `json:"data"`
	Total      int64                     `json:"total"`
	Page       int                       `json:"page"`
	PageSize   int                       `json:"page_size"`
	TotalPages int                       `json:"total_pages"`
}

// ParkingSlotResponse - Response de espacio de parqueo
type ParkingSlotResponse struct {
	ID            uint      `json:"id"`
	ParkingZoneID uint      `json:"parking_zone_id"`
	ParkingTypeID uint      `json:"parking_type_id"`
	SlotNumber    string    `json:"slot_number"`
	IsCovered     bool      `json:"is_covered"`
	Width         *float64  `json:"width"`
	Length        *float64  `json:"length"`
	Height        *float64  `json:"height"`
	HasCharger    bool      `json:"has_charger"`
	IsActive      bool      `json:"is_active"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// ParkingSlotListResponse - Response de lista de espacios de parqueo
type ParkingSlotListResponse struct {
	ID              uint   `json:"id"`
	ParkingZoneID   uint   `json:"parking_zone_id"`
	ParkingZoneName string `json:"parking_zone_name"`
	ParkingTypeID   uint   `json:"parking_type_id"`
	ParkingTypeName string `json:"parking_type_name"`
	SlotNumber      string `json:"slot_number"`
	IsCovered       bool   `json:"is_covered"`
	HasCharger      bool   `json:"has_charger"`
	IsActive        bool   `json:"is_active"`
	IsAvailable     bool   `json:"is_available"`
	IsAssigned      bool   `json:"is_assigned"`
	IsOccupied      bool   `json:"is_occupied"`
}

// PaginatedParkingSlotsResponse - Response paginado de espacios de parqueo
type PaginatedParkingSlotsResponse struct {
	Success    bool                      `json:"success"`
	Data       []ParkingSlotListResponse `json:"data"`
	Total      int64                     `json:"total"`
	Page       int                       `json:"page"`
	PageSize   int                       `json:"page_size"`
	TotalPages int                       `json:"total_pages"`
}

// ParkingAssignmentResponse - Response de asignación
type ParkingAssignmentResponse struct {
	ID             uint       `json:"id"`
	BusinessID     uint       `json:"business_id"`
	ParkingSlotID  uint       `json:"parking_slot_id"`
	PropertyUnitID *uint      `json:"property_unit_id"`
	ResidentID     *uint      `json:"resident_id"`
	VehiclePlate   string     `json:"vehicle_plate"`
	VehicleBrand   string     `json:"vehicle_brand"`
	VehicleModel   string     `json:"vehicle_model"`
	VehicleColor   string     `json:"vehicle_color"`
	StartDate      time.Time  `json:"start_date"`
	EndDate        *time.Time `json:"end_date"`
	IsActive       bool       `json:"is_active"`
	Notes          string     `json:"notes"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

// ParkingAssignmentListResponse - Response de lista de asignaciones
type ParkingAssignmentListResponse struct {
	ID                 uint       `json:"id"`
	ParkingSlotID      uint       `json:"parking_slot_id"`
	ParkingSlotNumber  string     `json:"parking_slot_number"`
	PropertyUnitID     *uint      `json:"property_unit_id"`
	PropertyUnitNumber string     `json:"property_unit_number"`
	ResidentID         *uint      `json:"resident_id"`
	ResidentName       string     `json:"resident_name"`
	VehiclePlate       string     `json:"vehicle_plate"`
	VehicleBrand       string     `json:"vehicle_brand"`
	VehicleModel       string     `json:"vehicle_model"`
	StartDate          time.Time  `json:"start_date"`
	EndDate            *time.Time `json:"end_date"`
	IsActive           bool       `json:"is_active"`
}

// PaginatedParkingAssignmentsResponse - Response paginado de asignaciones
type PaginatedParkingAssignmentsResponse struct {
	Success    bool                            `json:"success"`
	Data       []ParkingAssignmentListResponse `json:"data"`
	Total      int64                           `json:"total"`
	Page       int                             `json:"page"`
	PageSize   int                             `json:"page_size"`
	TotalPages int                             `json:"total_pages"`
}

// ParkingReservationResponse - Response de reserva
type ParkingReservationResponse struct {
	ID                  uint       `json:"id"`
	BusinessID          uint       `json:"business_id"`
	ParkingSlotID       uint       `json:"parking_slot_id"`
	PropertyUnitID      *uint      `json:"property_unit_id"`
	ResidentID          *uint      `json:"resident_id"`
	VisitorID           *uint      `json:"visitor_id"`
	ReservationStatusID uint       `json:"reservation_status_id"`
	ReservationDate     time.Time  `json:"reservation_date"`
	StartTime           string     `json:"start_time"`
	EndTime             string     `json:"end_time"`
	DurationHours       float64    `json:"duration_hours"`
	VehiclePlate        string     `json:"vehicle_plate"`
	QRCode              string     `json:"qr_code"`
	AccessCode          string     `json:"access_code"`
	CheckedInAt         *time.Time `json:"checked_in_at"`
	CheckedOutAt        *time.Time `json:"checked_out_at"`
	CreatedAt           time.Time  `json:"created_at"`
}

// ParkingReservationListResponse - Response de lista de reservas
type ParkingReservationListResponse struct {
	ID                 uint       `json:"id"`
	ParkingSlotID      uint       `json:"parking_slot_id"`
	ParkingSlotNumber  string     `json:"parking_slot_number"`
	PropertyUnitID     *uint      `json:"property_unit_id"`
	PropertyUnitNumber string     `json:"property_unit_number"`
	ResidentID         *uint      `json:"resident_id"`
	ResidentName       string     `json:"resident_name"`
	VisitorID          *uint      `json:"visitor_id"`
	VisitorName        string     `json:"visitor_name"`
	StatusName         string     `json:"status_name"`
	ReservationDate    time.Time  `json:"reservation_date"`
	StartTime          string     `json:"start_time"`
	EndTime            string     `json:"end_time"`
	VehiclePlate       string     `json:"vehicle_plate"`
	CheckedInAt        *time.Time `json:"checked_in_at"`
	CheckedOutAt       *time.Time `json:"checked_out_at"`
	CreatedAt          time.Time  `json:"created_at"`
}

// PaginatedParkingReservationsResponse - Response paginado de reservas
type PaginatedParkingReservationsResponse struct {
	Success    bool                             `json:"success"`
	Data       []ParkingReservationListResponse `json:"data"`
	Total      int64                            `json:"total"`
	Page       int                              `json:"page"`
	PageSize   int                              `json:"page_size"`
	TotalPages int                              `json:"total_pages"`
}

// CheckParkingAvailabilityResponse - Response de verificación de disponibilidad
type CheckParkingAvailabilityResponse struct {
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

// ParkingTypeResponse - Response de tipo de parqueadero
type ParkingTypeResponse struct {
	ID          uint      `json:"id"`
	Name        string    `json:"name"`
	Code        string    `json:"code"`
	Description string    `json:"description"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ParkingTypesResponse - Response de lista de tipos de parqueadero
type ParkingTypesResponse struct {
	Success bool                  `json:"success"`
	Data    []ParkingTypeResponse `json:"data"`
}
