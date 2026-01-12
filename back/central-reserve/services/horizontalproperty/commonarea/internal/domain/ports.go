package domain

import (
	"context"
	"time"
)

// CommonAreaRepository - Puerto para repositorio de zonas comunes
type CommonAreaRepository interface {
	CreateCommonArea(ctx context.Context, area *CommonArea) (*CommonArea, error)
	GetCommonAreaByID(ctx context.Context, id uint) (*CommonArea, error)
	UpdateCommonArea(ctx context.Context, area *CommonArea) error
	DeleteCommonArea(ctx context.Context, id uint) error
	ListCommonAreas(ctx context.Context, filters CommonAreaFiltersDTO) (*PaginatedCommonAreasDTO, error)
	GetCommonAreasByBusinessID(ctx context.Context, businessID uint) ([]*CommonArea, error)
	GetCommonAreaTypes(ctx context.Context) ([]*CommonAreaType, error)
}

// CommonAreaScheduleRepository - Puerto para repositorio de horarios
type CommonAreaScheduleRepository interface {
	CreateSchedule(ctx context.Context, schedule *CommonAreaSchedule) (*CommonAreaSchedule, error)
	GetSchedulesByCommonAreaID(ctx context.Context, commonAreaID uint) ([]*CommonAreaSchedule, error)
	UpdateSchedule(ctx context.Context, schedule *CommonAreaSchedule) error
	DeleteSchedule(ctx context.Context, id uint) error
	GetScheduleForDay(ctx context.Context, commonAreaID uint, dayOfWeek int) (*CommonAreaSchedule, error)
}

// CommonAreaRestrictionRepository - Puerto para repositorio de restricciones
type CommonAreaRestrictionRepository interface {
	CreateRestriction(ctx context.Context, restriction *CommonAreaRestriction) (*CommonAreaRestriction, error)
	GetActiveRestrictions(ctx context.Context, commonAreaID uint, date time.Time, startTime, endTime string) ([]*CommonAreaRestriction, error)
	DeleteRestriction(ctx context.Context, id uint) error
}

// CommonAreaReservationRepository - Puerto para repositorio de reservas
type CommonAreaReservationRepository interface {
	CreateReservation(ctx context.Context, reservation *CommonAreaReservation) (*CommonAreaReservation, error)
	GetReservationByID(ctx context.Context, id uint) (*CommonAreaReservation, error)
	UpdateReservation(ctx context.Context, reservation *CommonAreaReservation) error
	ListReservations(ctx context.Context, filters ReservationFiltersDTO) (*PaginatedReservationsDTO, error)
	CheckAvailability(ctx context.Context, dto CheckAvailabilityDTO) (bool, error)
	GetOverlappingReservations(ctx context.Context, commonAreaID uint, date time.Time, startTime, endTime string, excludeID *uint) ([]*CommonAreaReservation, error)
	GetReservationsByDateRange(ctx context.Context, commonAreaID uint, startDate, endDate time.Time) ([]*CommonAreaReservation, error)
	GetPendingReservations(ctx context.Context, businessID uint) ([]*CommonAreaReservation, error)
}

// CommonAreaUseCase - Puerto para casos de uso
type CommonAreaUseCase interface {
	CreateCommonArea(ctx context.Context, dto CreateCommonAreaDTO) (*CommonArea, error)
	GetCommonAreaByID(ctx context.Context, id uint) (*CommonArea, error)
	ListCommonAreas(ctx context.Context, filters CommonAreaFiltersDTO) (*PaginatedCommonAreasDTO, error)
	GetCommonAreaTypes(ctx context.Context) ([]*CommonAreaType, error)
	CreateReservation(ctx context.Context, dto CreateReservationDTO) (*CommonAreaReservation, error)
	ApproveReservation(ctx context.Context, reservationID uint, userID uint) (*CommonAreaReservation, error)
	RejectReservation(ctx context.Context, reservationID uint, userID uint, reason string) (*CommonAreaReservation, error)
	CheckAvailability(ctx context.Context, dto CheckAvailabilityDTO) (bool, error)
	CheckInReservation(ctx context.Context, reservationID uint, userID uint) (*CommonAreaReservation, error)
	CheckOutReservation(ctx context.Context, reservationID uint, userID uint) (*CommonAreaReservation, error)
	CancelReservation(ctx context.Context, reservationID uint, userID uint, reason string) (*CommonAreaReservation, error)
	ListReservations(ctx context.Context, filters ReservationFiltersDTO) (*PaginatedReservationsDTO, error)
	GetReservationByID(ctx context.Context, id uint) (*CommonAreaReservation, error)
}
