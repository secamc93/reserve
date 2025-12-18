package domain

import "context"

// ParkingZoneRepository - Puerto para repositorio de zonas de parqueo
type ParkingZoneRepository interface {
	CreateParkingZone(ctx context.Context, zone *ParkingZone) (*ParkingZone, error)
	GetParkingZoneByID(ctx context.Context, id uint) (*ParkingZone, error)
	UpdateParkingZone(ctx context.Context, zone *ParkingZone) error
	DeleteParkingZone(ctx context.Context, id uint) error
	ListParkingZones(ctx context.Context, filters ParkingZoneFiltersDTO) (*PaginatedParkingZonesDTO, error)
	GetParkingZonesByBusinessID(ctx context.Context, businessID uint) ([]*ParkingZone, error)
}

// ParkingSlotRepository - Puerto para repositorio de espacios de parqueo
type ParkingSlotRepository interface {
	CreateParkingSlot(ctx context.Context, slot *ParkingSlot) (*ParkingSlot, error)
	GetParkingSlotByID(ctx context.Context, id uint) (*ParkingSlot, error)
	UpdateParkingSlot(ctx context.Context, slot *ParkingSlot) error
	DeleteParkingSlot(ctx context.Context, id uint) error
	ListParkingSlots(ctx context.Context, filters ParkingSlotFiltersDTO) (*PaginatedParkingSlotsDTO, error)
	GetParkingSlotsByZoneID(ctx context.Context, zoneID uint) ([]*ParkingSlot, error)
	GetParkingSlotsByBusinessID(ctx context.Context, businessID uint) ([]*ParkingSlot, error)
	IsSlotAvailable(ctx context.Context, slotID uint, date string, startTime, endTime string, excludeReservationID *uint) (bool, error)
}

// ParkingAssignmentRepository - Puerto para repositorio de asignaciones
type ParkingAssignmentRepository interface {
	CreateParkingAssignment(ctx context.Context, assignment *ParkingAssignment) (*ParkingAssignment, error)
	GetParkingAssignmentByID(ctx context.Context, id uint) (*ParkingAssignment, error)
	UpdateParkingAssignment(ctx context.Context, assignment *ParkingAssignment) error
	DeleteParkingAssignment(ctx context.Context, id uint) error
	ListParkingAssignments(ctx context.Context, filters ParkingAssignmentFiltersDTO) (*PaginatedParkingAssignmentsDTO, error)
	GetActiveAssignmentBySlotID(ctx context.Context, slotID uint) (*ParkingAssignment, error)
	GetAssignmentsByPropertyUnitID(ctx context.Context, propertyUnitID uint) ([]*ParkingAssignment, error)
	GetAssignmentsByResidentID(ctx context.Context, residentID uint) ([]*ParkingAssignment, error)
}

// ParkingReservationRepository - Puerto para repositorio de reservas
type ParkingReservationRepository interface {
	CreateParkingReservation(ctx context.Context, reservation *ParkingReservation) (*ParkingReservation, error)
	GetParkingReservationByID(ctx context.Context, id uint) (*ParkingReservation, error)
	UpdateParkingReservation(ctx context.Context, reservation *ParkingReservation) error
	DeleteParkingReservation(ctx context.Context, id uint) error
	ListParkingReservations(ctx context.Context, filters ParkingReservationFiltersDTO) (*PaginatedParkingReservationsDTO, error)
	CheckAvailability(ctx context.Context, dto CheckParkingAvailabilityDTO) (bool, error)
	GetOverlappingReservations(ctx context.Context, slotID uint, date string, startTime, endTime string, excludeID *uint) ([]*ParkingReservation, error)
	GetReservationsByDateRange(ctx context.Context, slotID uint, startDate, endDate string) ([]*ParkingReservation, error)
	GetPendingReservations(ctx context.Context, businessID uint) ([]*ParkingReservation, error)
}

// ParkingOccupancyRepository - Puerto para repositorio de ocupación
type ParkingOccupancyRepository interface {
	CreateParkingOccupancy(ctx context.Context, occupancy *ParkingOccupancy) (*ParkingOccupancy, error)
	GetParkingOccupancyByID(ctx context.Context, id uint) (*ParkingOccupancy, error)
	UpdateParkingOccupancy(ctx context.Context, occupancy *ParkingOccupancy) error
	GetActiveOccupancyBySlotID(ctx context.Context, slotID uint) (*ParkingOccupancy, error)
	GetOccupanciesBySlotID(ctx context.Context, slotID uint, startDate, endDate string) ([]*ParkingOccupancy, error)
}

// ParkingUseCase - Puerto para casos de uso
type ParkingUseCase interface {
	CreateParkingZone(ctx context.Context, dto CreateParkingZoneDTO) (*ParkingZone, error)
	GetParkingZoneByID(ctx context.Context, id uint) (*ParkingZone, error)
	ListParkingZones(ctx context.Context, filters ParkingZoneFiltersDTO) (*PaginatedParkingZonesDTO, error)
	CreateParkingSlot(ctx context.Context, dto CreateParkingSlotDTO) (*ParkingSlot, error)
	GetParkingSlotByID(ctx context.Context, id uint) (*ParkingSlot, error)
	ListParkingSlots(ctx context.Context, filters ParkingSlotFiltersDTO) (*PaginatedParkingSlotsDTO, error)
	AssignParking(ctx context.Context, dto AssignParkingDTO) (*ParkingAssignment, error)
	GetParkingAssignmentByID(ctx context.Context, id uint) (*ParkingAssignment, error)
	ListParkingAssignments(ctx context.Context, filters ParkingAssignmentFiltersDTO) (*PaginatedParkingAssignmentsDTO, error)
	CreateParkingReservation(ctx context.Context, dto CreateParkingReservationDTO) (*ParkingReservation, error)
	GetParkingReservationByID(ctx context.Context, id uint) (*ParkingReservation, error)
	ListParkingReservations(ctx context.Context, filters ParkingReservationFiltersDTO) (*PaginatedParkingReservationsDTO, error)
	CheckParkingAvailability(ctx context.Context, dto CheckParkingAvailabilityDTO) (bool, error)
	CheckInParking(ctx context.Context, reservationID uint, userID uint) (*ParkingReservation, error)
	CheckOutParking(ctx context.Context, reservationID uint, userID uint) (*ParkingReservation, error)
	CancelParkingReservation(ctx context.Context, reservationID uint, userID uint, reason string) (*ParkingReservation, error)
}
