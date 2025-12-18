package request

import "time"

// CreateParkingZoneRequest - Request para crear zona de parqueo
type CreateParkingZoneRequest struct {
	Name        string `json:"name" binding:"required"`
	Code        string `json:"code" binding:"required"`
	Description string `json:"description"`
	Location    string `json:"location"`
}

// ListParkingZonesRequest - Request para listar zonas de parqueo
type ListParkingZonesRequest struct {
	IsActive *bool `form:"is_active"`
	Page     int   `form:"page,default=1" binding:"min=1"`
	PageSize int   `form:"page_size,default=10" binding:"min=1,max=100"`
}

// CreateParkingSlotRequest - Request para crear espacio de parqueo
type CreateParkingSlotRequest struct {
	ParkingZoneID uint     `json:"parking_zone_id" binding:"required"`
	ParkingTypeID uint     `json:"parking_type_id" binding:"required"`
	SlotNumber    string   `json:"slot_number" binding:"required"`
	IsCovered     bool     `json:"is_covered"`
	Width         *float64 `json:"width"`
	Length        *float64 `json:"length"`
	Height        *float64 `json:"height"`
	HasCharger    bool     `json:"has_charger"`
}

// ListParkingSlotsRequest - Request para listar espacios de parqueo
type ListParkingSlotsRequest struct {
	ParkingZoneID *uint `form:"parking_zone_id"`
	ParkingTypeID *uint `form:"parking_type_id"`
	IsActive      *bool `form:"is_active"`
	IsAvailable   *bool `form:"is_available"`
	Page          int   `form:"page,default=1" binding:"min=1"`
	PageSize      int   `form:"page_size,default=10" binding:"min=1,max=100"`
}

// AssignParkingRequest - Request para asignar parqueadero permanente
type AssignParkingRequest struct {
	ParkingSlotID  uint       `json:"parking_slot_id" binding:"required"`
	PropertyUnitID *uint      `json:"property_unit_id"`
	ResidentID     *uint      `json:"resident_id"`
	VehiclePlate   string     `json:"vehicle_plate" binding:"required"`
	VehicleBrand   string     `json:"vehicle_brand"`
	VehicleModel   string     `json:"vehicle_model"`
	VehicleColor   string     `json:"vehicle_color"`
	StartDate      time.Time  `json:"start_date" binding:"required"`
	EndDate        *time.Time `json:"end_date"`
	Notes          string     `json:"notes"`
}

// ListParkingAssignmentsRequest - Request para listar asignaciones
type ListParkingAssignmentsRequest struct {
	ParkingSlotID  *uint `form:"parking_slot_id"`
	PropertyUnitID *uint `form:"property_unit_id"`
	ResidentID     *uint `form:"resident_id"`
	IsActive       *bool `form:"is_active"`
	Page           int   `form:"page,default=1" binding:"min=1"`
	PageSize       int   `form:"page_size,default=10" binding:"min=1,max=100"`
}

// CreateParkingReservationRequest - Request para crear reserva temporal
type CreateParkingReservationRequest struct {
	ParkingSlotID    uint      `json:"parking_slot_id" binding:"required"`
	PropertyUnitID   *uint     `json:"property_unit_id"`
	ResidentID       *uint     `json:"resident_id"`
	VisitorID        *uint     `json:"visitor_id"`
	VisitorVehicleID *uint     `json:"visitor_vehicle_id"`
	ReservationDate  time.Time `json:"reservation_date" binding:"required"`
	StartTime        string    `json:"start_time" binding:"required"`
	EndTime          string    `json:"end_time" binding:"required"`
	VehiclePlate     string    `json:"vehicle_plate" binding:"required"`
	VehicleBrand     string    `json:"vehicle_brand"`
	VehicleModel     string    `json:"vehicle_model"`
	VehicleColor     string    `json:"vehicle_color"`
	RequiresApproval bool      `json:"requires_approval"`
	Notes            string    `json:"notes"`
	ResidentNotes    string    `json:"resident_notes"`
}

// ListParkingReservationsRequest - Request para listar reservas
type ListParkingReservationsRequest struct {
	ParkingSlotID       *uint      `form:"parking_slot_id"`
	PropertyUnitID      *uint      `form:"property_unit_id"`
	ResidentID          *uint      `form:"resident_id"`
	VisitorID           *uint      `form:"visitor_id"`
	ReservationStatusID *uint      `form:"reservation_status_id"`
	StartDate           *time.Time `form:"start_date"`
	EndDate             *time.Time `form:"end_date"`
	Page                int        `form:"page,default=1" binding:"min=1"`
	PageSize            int        `form:"page_size,default=10" binding:"min=1,max=100"`
}

// CheckParkingAvailabilityRequest - Request para verificar disponibilidad
type CheckParkingAvailabilityRequest struct {
	ParkingSlotID   uint      `json:"parking_slot_id" binding:"required"`
	ReservationDate time.Time `json:"reservation_date" binding:"required"`
	StartTime       string    `json:"start_time" binding:"required"`
	EndTime         string    `json:"end_time" binding:"required"`
}

// CancelParkingReservationRequest - Request para cancelar reserva
type CancelParkingReservationRequest struct {
	Reason string `json:"reason"`
}
