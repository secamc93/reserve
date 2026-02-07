package mocks

import (
	"context"
	"time"

	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
)

// MockReservationRepository - Mock del repositorio de reservas
type MockReservationRepository struct {
	CreateReservationFunc          func(ctx context.Context, reservation *domain.CommonAreaReservation) (*domain.CommonAreaReservation, error)
	GetReservationByIDFunc         func(ctx context.Context, id uint) (*domain.CommonAreaReservation, error)
	UpdateReservationFunc          func(ctx context.Context, reservation *domain.CommonAreaReservation) error
	ChangeReservationStatusFunc    func(ctx context.Context, reservationID uint, newStatusCode string) error
	ListReservationsFunc           func(ctx context.Context, filters domain.ReservationFiltersDTO) (*domain.PaginatedReservationsDTO, error)
	CheckAvailabilityFunc          func(ctx context.Context, dto domain.CheckAvailabilityDTO) (bool, error)
	GetOverlappingReservationsFunc func(ctx context.Context, commonAreaID uint, date time.Time, startTime, endTime string, excludeID *uint) ([]*domain.CommonAreaReservation, error)
	GetReservationsByDateRangeFunc func(ctx context.Context, commonAreaID uint, startDate, endDate time.Time) ([]*domain.CommonAreaReservation, error)
	GetPendingReservationsFunc     func(ctx context.Context, businessID uint) ([]*domain.CommonAreaReservation, error)
}

func (m *MockReservationRepository) CreateReservation(ctx context.Context, reservation *domain.CommonAreaReservation) (*domain.CommonAreaReservation, error) {
	if m.CreateReservationFunc != nil {
		return m.CreateReservationFunc(ctx, reservation)
	}
	return nil, nil
}

func (m *MockReservationRepository) GetReservationByID(ctx context.Context, id uint) (*domain.CommonAreaReservation, error) {
	if m.GetReservationByIDFunc != nil {
		return m.GetReservationByIDFunc(ctx, id)
	}
	return nil, nil
}

func (m *MockReservationRepository) UpdateReservation(ctx context.Context, reservation *domain.CommonAreaReservation) error {
	if m.UpdateReservationFunc != nil {
		return m.UpdateReservationFunc(ctx, reservation)
	}
	return nil
}

func (m *MockReservationRepository) ChangeReservationStatus(ctx context.Context, reservationID uint, newStatusCode string) error {
	if m.ChangeReservationStatusFunc != nil {
		return m.ChangeReservationStatusFunc(ctx, reservationID, newStatusCode)
	}
	return nil
}

func (m *MockReservationRepository) ListReservations(ctx context.Context, filters domain.ReservationFiltersDTO) (*domain.PaginatedReservationsDTO, error) {
	if m.ListReservationsFunc != nil {
		return m.ListReservationsFunc(ctx, filters)
	}
	return nil, nil
}

func (m *MockReservationRepository) CheckAvailability(ctx context.Context, dto domain.CheckAvailabilityDTO) (bool, error) {
	if m.CheckAvailabilityFunc != nil {
		return m.CheckAvailabilityFunc(ctx, dto)
	}
	return false, nil
}

func (m *MockReservationRepository) GetOverlappingReservations(ctx context.Context, commonAreaID uint, date time.Time, startTime, endTime string, excludeID *uint) ([]*domain.CommonAreaReservation, error) {
	if m.GetOverlappingReservationsFunc != nil {
		return m.GetOverlappingReservationsFunc(ctx, commonAreaID, date, startTime, endTime, excludeID)
	}
	return nil, nil
}

func (m *MockReservationRepository) GetReservationsByDateRange(ctx context.Context, commonAreaID uint, startDate, endDate time.Time) ([]*domain.CommonAreaReservation, error) {
	if m.GetReservationsByDateRangeFunc != nil {
		return m.GetReservationsByDateRangeFunc(ctx, commonAreaID, startDate, endDate)
	}
	return nil, nil
}

func (m *MockReservationRepository) GetPendingReservations(ctx context.Context, businessID uint) ([]*domain.CommonAreaReservation, error) {
	if m.GetPendingReservationsFunc != nil {
		return m.GetPendingReservationsFunc(ctx, businessID)
	}
	return nil, nil
}
