package mocks

import (
	"context"

	"central_reserve/services/sporttraining/booking/internal/domain"
)

// MockBookingRepository - Mock del repositorio de reservas
type MockBookingRepository struct {
	CreateFunc                  func(ctx context.Context, booking *domain.Booking) (*domain.Booking, error)
	GetByIDFunc                 func(ctx context.Context, id uint, businessID uint) (*domain.Booking, error)
	UpdateFunc                  func(ctx context.Context, booking *domain.Booking) (*domain.Booking, error)
	ListFunc                    func(ctx context.Context, filters domain.BookingFiltersDTO) (*domain.PaginatedBookingsDTO, error)
	GetBookingStatusByCodeFunc  func(ctx context.Context, code string) (*domain.StatusRef, error)
}

func (m *MockBookingRepository) Create(ctx context.Context, booking *domain.Booking) (*domain.Booking, error) {
	if m.CreateFunc != nil {
		return m.CreateFunc(ctx, booking)
	}
	return nil, nil
}

func (m *MockBookingRepository) GetByID(ctx context.Context, id uint, businessID uint) (*domain.Booking, error) {
	if m.GetByIDFunc != nil {
		return m.GetByIDFunc(ctx, id, businessID)
	}
	return nil, nil
}

func (m *MockBookingRepository) Update(ctx context.Context, booking *domain.Booking) (*domain.Booking, error) {
	if m.UpdateFunc != nil {
		return m.UpdateFunc(ctx, booking)
	}
	return nil, nil
}

func (m *MockBookingRepository) List(ctx context.Context, filters domain.BookingFiltersDTO) (*domain.PaginatedBookingsDTO, error) {
	if m.ListFunc != nil {
		return m.ListFunc(ctx, filters)
	}
	return nil, nil
}

func (m *MockBookingRepository) GetBookingStatusByCode(ctx context.Context, code string) (*domain.StatusRef, error) {
	if m.GetBookingStatusByCodeFunc != nil {
		return m.GetBookingStatusByCodeFunc(ctx, code)
	}
	return nil, nil
}
