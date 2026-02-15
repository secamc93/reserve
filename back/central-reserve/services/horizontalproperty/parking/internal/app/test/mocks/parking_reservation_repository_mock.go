package mocks

import (
	"context"

	"central_reserve/services/horizontalproperty/parking/internal/domain"
)

// ParkingReservationRepositoryMock - Mock del repositorio de reservas de parqueo
type ParkingReservationRepositoryMock struct {
	CreateParkingReservationFn      func(ctx context.Context, reservation *domain.ParkingReservation) (*domain.ParkingReservation, error)
	GetParkingReservationByIDFn     func(ctx context.Context, id uint) (*domain.ParkingReservation, error)
	UpdateParkingReservationFn      func(ctx context.Context, reservation *domain.ParkingReservation) error
	DeleteParkingReservationFn      func(ctx context.Context, id uint) error
	ListParkingReservationsFn       func(ctx context.Context, filters domain.ParkingReservationFiltersDTO) (*domain.PaginatedParkingReservationsDTO, error)
	CheckAvailabilityFn             func(ctx context.Context, dto domain.CheckParkingAvailabilityDTO) (bool, error)
	GetOverlappingReservationsFn    func(ctx context.Context, slotID uint, date string, startTime, endTime string, excludeID *uint) ([]*domain.ParkingReservation, error)
	GetReservationsByDateRangeFn    func(ctx context.Context, slotID uint, startDate, endDate string) ([]*domain.ParkingReservation, error)
	GetPendingReservationsFn        func(ctx context.Context, businessID uint) ([]*domain.ParkingReservation, error)
}

func (m *ParkingReservationRepositoryMock) CreateParkingReservation(ctx context.Context, reservation *domain.ParkingReservation) (*domain.ParkingReservation, error) {
	if m.CreateParkingReservationFn != nil {
		return m.CreateParkingReservationFn(ctx, reservation)
	}
	return reservation, nil
}

func (m *ParkingReservationRepositoryMock) GetParkingReservationByID(ctx context.Context, id uint) (*domain.ParkingReservation, error) {
	if m.GetParkingReservationByIDFn != nil {
		return m.GetParkingReservationByIDFn(ctx, id)
	}
	return nil, nil
}

func (m *ParkingReservationRepositoryMock) UpdateParkingReservation(ctx context.Context, reservation *domain.ParkingReservation) error {
	if m.UpdateParkingReservationFn != nil {
		return m.UpdateParkingReservationFn(ctx, reservation)
	}
	return nil
}

func (m *ParkingReservationRepositoryMock) DeleteParkingReservation(ctx context.Context, id uint) error {
	if m.DeleteParkingReservationFn != nil {
		return m.DeleteParkingReservationFn(ctx, id)
	}
	return nil
}

func (m *ParkingReservationRepositoryMock) ListParkingReservations(ctx context.Context, filters domain.ParkingReservationFiltersDTO) (*domain.PaginatedParkingReservationsDTO, error) {
	if m.ListParkingReservationsFn != nil {
		return m.ListParkingReservationsFn(ctx, filters)
	}
	return &domain.PaginatedParkingReservationsDTO{}, nil
}

func (m *ParkingReservationRepositoryMock) CheckAvailability(ctx context.Context, dto domain.CheckParkingAvailabilityDTO) (bool, error) {
	if m.CheckAvailabilityFn != nil {
		return m.CheckAvailabilityFn(ctx, dto)
	}
	return true, nil
}

func (m *ParkingReservationRepositoryMock) GetOverlappingReservations(ctx context.Context, slotID uint, date string, startTime, endTime string, excludeID *uint) ([]*domain.ParkingReservation, error) {
	if m.GetOverlappingReservationsFn != nil {
		return m.GetOverlappingReservationsFn(ctx, slotID, date, startTime, endTime, excludeID)
	}
	return []*domain.ParkingReservation{}, nil
}

func (m *ParkingReservationRepositoryMock) GetReservationsByDateRange(ctx context.Context, slotID uint, startDate, endDate string) ([]*domain.ParkingReservation, error) {
	if m.GetReservationsByDateRangeFn != nil {
		return m.GetReservationsByDateRangeFn(ctx, slotID, startDate, endDate)
	}
	return []*domain.ParkingReservation{}, nil
}

func (m *ParkingReservationRepositoryMock) GetPendingReservations(ctx context.Context, businessID uint) ([]*domain.ParkingReservation, error) {
	if m.GetPendingReservationsFn != nil {
		return m.GetPendingReservationsFn(ctx, businessID)
	}
	return []*domain.ParkingReservation{}, nil
}
