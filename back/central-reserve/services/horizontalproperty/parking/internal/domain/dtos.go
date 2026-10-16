package domain

import "time"

// CreateParkingZoneDTO - DTO para crear zona de parqueo
type CreateParkingZoneDTO struct {
	BusinessID  uint
	Name        string
	Code        string
	Description string
	Location    string
}

// CreateParkingSlotDTO - DTO para crear espacio de parqueo
type CreateParkingSlotDTO struct {
	ParkingZoneID uint
	ParkingTypeID uint
	SlotNumber    string
	IsCovered     bool
	Width         *float64
	Length        *float64
	Height        *float64
	HasCharger    bool
}

// AssignParkingDTO - DTO para asignar parqueadero permanente
// CreateParkingSlotsBulkDTO crea varios cupos de una zona con numeración consecutiva:
// Prefix + número desde From hasta To, rellenado con ceros hasta Pad dígitos ("P2-" + 121 → "P2-121").
type CreateParkingSlotsBulkDTO struct {
	BusinessID    uint
	ParkingZoneID uint
	ParkingTypeID uint
	Prefix        string
	From          int
	To            int
	Pad           int
	IsCovered     bool
	HasCharger    bool
	Width         *float64
	Length        *float64
	Height        *float64
}

// UpdateParkingAssignmentDTO edita el vehículo y la vigencia de una asignación.
type UpdateParkingAssignmentDTO struct {
	BusinessID   uint
	ID           uint
	VehiclePlate string
	VehicleBrand string
	VehicleModel string
	VehicleColor string
	EndDate      *time.Time // nil = indefinida
	Notes        string
}

// ParkingAssignmentSummaryDTO conteos para los chips de asignaciones.
type ParkingAssignmentSummaryDTO struct {
	Active           int64 // vigentes (activas y sin vencer)
	Expiring30       int64 // activas que vencen en los próximos 30 días
	Expired          int64 // activas con fecha de fin pasada (no liberadas)
	UnitsWithoutSlot int64 // unidades activas sin ninguna asignación activa
}

// Estados de asignación para filtrar.
const (
	AssignmentStatusActive   = "active"
	AssignmentStatusExpiring = "expiring"
	AssignmentStatusExpired  = "expired"
)

type AssignParkingDTO struct {
	BusinessID       uint
	ParkingSlotID    uint
	PropertyUnitID   *uint
	ResidentID       *uint
	VehiclePlate     string
	VehicleBrand     string
	VehicleModel     string
	VehicleColor     string
	StartDate        time.Time
	EndDate          *time.Time
	Notes            string
	AssignedByUserID uint
}

// CreateParkingReservationDTO - DTO para crear reserva temporal
type CreateParkingReservationDTO struct {
	BusinessID       uint
	ParkingSlotID    uint
	PropertyUnitID   *uint
	ResidentID       *uint
	VisitorID        *uint
	VisitorVehicleID *uint
	ReservationDate  time.Time
	StartTime        string
	EndTime          string
	VehiclePlate     string
	VehicleBrand     string
	VehicleModel     string
	VehicleColor     string
	RequiresApproval bool
	Notes            string
	ResidentNotes    string
}

// CheckParkingAvailabilityDTO - DTO para verificar disponibilidad
type CheckParkingAvailabilityDTO struct {
	ParkingSlotID        uint
	ReservationDate      time.Time
	StartTime            string
	EndTime              string
	ExcludeReservationID *uint // Para excluir una reserva existente (en caso de edición)
}

// ParkingZoneFiltersDTO - Filtros para listar zonas de parqueo
type ParkingZoneFiltersDTO struct {
	BusinessID uint
	IsActive   *bool
	Page       int
	PageSize   int
}

// ParkingSlotFiltersDTO - Filtros para listar espacios de parqueo
type ParkingSlotFiltersDTO struct {
	BusinessID    uint
	ParkingZoneID *uint
	ParkingTypeID *uint
	IsActive      *bool
	IsAvailable   *bool // Si está disponible (no asignado ni ocupado)
	Page          int
	PageSize      int
}

// ParkingAssignmentFiltersDTO - Filtros para listar asignaciones
type ParkingAssignmentFiltersDTO struct {
	BusinessID     uint
	ParkingSlotID  *uint
	PropertyUnitID *uint
	ResidentID     *uint
	IsActive       *bool
	Status         string    // active | expiring | expired (ver AssignmentStatus*)
	Search         string    // placa, número de unidad o nombre del residente
	Today          time.Time // fecha de referencia para Status (zona horaria de la propiedad)
	Page           int
	PageSize       int
}

// ParkingReservationFiltersDTO - Filtros para listar reservas
type ParkingReservationFiltersDTO struct {
	BusinessID          uint
	ParkingSlotID       *uint
	PropertyUnitID      *uint
	ResidentID          *uint
	VisitorID           *uint
	ReservationStatusID *uint
	StartDate           *time.Time
	EndDate             *time.Time
	Page                int
	PageSize            int
}

// PaginatedParkingZonesDTO - Resultado paginado de zonas de parqueo
type PaginatedParkingZonesDTO struct {
	ParkingZones []ParkingZoneListDTO
	Total        int64
	Page         int
	PageSize     int
	TotalPages   int
}

// ParkingZoneListDTO - DTO para lista de zonas de parqueo
type ParkingZoneListDTO struct {
	ID         uint
	Name       string
	Code       string
	Location   string
	TotalSlots int
	IsActive   bool
}

// PaginatedParkingSlotsDTO - Resultado paginado de espacios de parqueo
type PaginatedParkingSlotsDTO struct {
	ParkingSlots []ParkingSlotListDTO
	Total        int64
	Page         int
	PageSize     int
	TotalPages   int
}

// ParkingSlotListDTO - DTO para lista de espacios de parqueo
type ParkingSlotListDTO struct {
	ID              uint
	ParkingZoneID   uint
	ParkingZoneName string
	ParkingTypeID   uint
	ParkingTypeName string
	SlotNumber      string
	IsCovered       bool
	HasCharger      bool
	Width           *float64
	Length          *float64
	Height          *float64
	IsActive        bool
	IsAvailable     bool
	IsAssigned      bool
	IsOccupied      bool
}

// PaginatedParkingAssignmentsDTO - Resultado paginado de asignaciones
type PaginatedParkingAssignmentsDTO struct {
	ParkingAssignments []ParkingAssignmentListDTO
	Total              int64
	Page               int
	PageSize           int
	TotalPages         int
}

// ParkingAssignmentListDTO - DTO para lista de asignaciones
type ParkingAssignmentListDTO struct {
	ID                 uint
	ParkingSlotID      uint
	ParkingSlotNumber  string
	ParkingZoneName    string
	PropertyUnitID     *uint
	PropertyUnitNumber string
	PropertyUnitBlock  string
	ResidentID         *uint
	ResidentName       string
	VehiclePlate       string
	VehicleBrand       string
	VehicleModel       string
	VehicleColor       string
	Notes              string
	StartDate          time.Time
	EndDate            *time.Time
	IsActive           bool
}

// PaginatedParkingReservationsDTO - Resultado paginado de reservas
type PaginatedParkingReservationsDTO struct {
	ParkingReservations []ParkingReservationListDTO
	Total               int64
	Page                int
	PageSize            int
	TotalPages          int
}

// ParkingReservationListDTO - DTO para lista de reservas
type ParkingReservationListDTO struct {
	ID                 uint
	ParkingSlotID      uint
	ParkingSlotNumber  string
	PropertyUnitID     *uint
	PropertyUnitNumber string
	ResidentID         *uint
	ResidentName       string
	VisitorID          *uint
	VisitorName        string
	StatusName         string
	ReservationDate    time.Time
	StartTime          string
	EndTime            string
	VehiclePlate       string
	CheckedInAt        *time.Time
	CheckedOutAt       *time.Time
	CreatedAt          time.Time
}
