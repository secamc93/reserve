package app

import (
	"central_reserve/services/horizontalproperty/parking/internal/domain"
	"central_reserve/shared/log"
)

type parkingUseCase struct {
	parkingZoneRepo        domain.ParkingZoneRepository
	parkingSlotRepo        domain.ParkingSlotRepository
	parkingAssignmentRepo  domain.ParkingAssignmentRepository
	parkingReservationRepo domain.ParkingReservationRepository
	parkingOccupancyRepo   domain.ParkingOccupancyRepository
	logger                 log.ILogger
}

// New crea una nueva instancia del caso de uso
func New(
	parkingZoneRepo domain.ParkingZoneRepository,
	parkingSlotRepo domain.ParkingSlotRepository,
	parkingAssignmentRepo domain.ParkingAssignmentRepository,
	parkingReservationRepo domain.ParkingReservationRepository,
	parkingOccupancyRepo domain.ParkingOccupancyRepository,
	logger log.ILogger,
) domain.ParkingUseCase {
	contextualLogger := logger.WithModule("parqueaderos")
	return &parkingUseCase{
		parkingZoneRepo:        parkingZoneRepo,
		parkingSlotRepo:        parkingSlotRepo,
		parkingAssignmentRepo:  parkingAssignmentRepo,
		parkingReservationRepo: parkingReservationRepo,
		parkingOccupancyRepo:   parkingOccupancyRepo,
		logger:                 contextualLogger,
	}
}
