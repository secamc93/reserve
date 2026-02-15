package mocks

import (
	"context"

	"central_reserve/services/horizontalproperty/parking/internal/domain"
)

// ParkingSlotRepositoryMock - Mock del repositorio de espacios de parqueo
type ParkingSlotRepositoryMock struct {
	CreateParkingSlotFn            func(ctx context.Context, slot *domain.ParkingSlot) (*domain.ParkingSlot, error)
	GetParkingSlotByIDFn           func(ctx context.Context, id uint) (*domain.ParkingSlot, error)
	UpdateParkingSlotFn            func(ctx context.Context, slot *domain.ParkingSlot) error
	DeleteParkingSlotFn            func(ctx context.Context, id uint) error
	ListParkingSlotsFn             func(ctx context.Context, filters domain.ParkingSlotFiltersDTO) (*domain.PaginatedParkingSlotsDTO, error)
	GetParkingSlotsByZoneIDFn      func(ctx context.Context, zoneID uint) ([]*domain.ParkingSlot, error)
	GetParkingSlotsByBusinessIDFn  func(ctx context.Context, businessID uint) ([]*domain.ParkingSlot, error)
	IsSlotAvailableFn              func(ctx context.Context, slotID uint, date string, startTime, endTime string, excludeReservationID *uint) (bool, error)
}

func (m *ParkingSlotRepositoryMock) CreateParkingSlot(ctx context.Context, slot *domain.ParkingSlot) (*domain.ParkingSlot, error) {
	if m.CreateParkingSlotFn != nil {
		return m.CreateParkingSlotFn(ctx, slot)
	}
	return slot, nil
}

func (m *ParkingSlotRepositoryMock) GetParkingSlotByID(ctx context.Context, id uint) (*domain.ParkingSlot, error) {
	if m.GetParkingSlotByIDFn != nil {
		return m.GetParkingSlotByIDFn(ctx, id)
	}
	return nil, nil
}

func (m *ParkingSlotRepositoryMock) UpdateParkingSlot(ctx context.Context, slot *domain.ParkingSlot) error {
	if m.UpdateParkingSlotFn != nil {
		return m.UpdateParkingSlotFn(ctx, slot)
	}
	return nil
}

func (m *ParkingSlotRepositoryMock) DeleteParkingSlot(ctx context.Context, id uint) error {
	if m.DeleteParkingSlotFn != nil {
		return m.DeleteParkingSlotFn(ctx, id)
	}
	return nil
}

func (m *ParkingSlotRepositoryMock) ListParkingSlots(ctx context.Context, filters domain.ParkingSlotFiltersDTO) (*domain.PaginatedParkingSlotsDTO, error) {
	if m.ListParkingSlotsFn != nil {
		return m.ListParkingSlotsFn(ctx, filters)
	}
	return &domain.PaginatedParkingSlotsDTO{}, nil
}

func (m *ParkingSlotRepositoryMock) GetParkingSlotsByZoneID(ctx context.Context, zoneID uint) ([]*domain.ParkingSlot, error) {
	if m.GetParkingSlotsByZoneIDFn != nil {
		return m.GetParkingSlotsByZoneIDFn(ctx, zoneID)
	}
	return []*domain.ParkingSlot{}, nil
}

func (m *ParkingSlotRepositoryMock) GetParkingSlotsByBusinessID(ctx context.Context, businessID uint) ([]*domain.ParkingSlot, error) {
	if m.GetParkingSlotsByBusinessIDFn != nil {
		return m.GetParkingSlotsByBusinessIDFn(ctx, businessID)
	}
	return []*domain.ParkingSlot{}, nil
}

func (m *ParkingSlotRepositoryMock) IsSlotAvailable(ctx context.Context, slotID uint, date string, startTime, endTime string, excludeReservationID *uint) (bool, error) {
	if m.IsSlotAvailableFn != nil {
		return m.IsSlotAvailableFn(ctx, slotID, date, startTime, endTime, excludeReservationID)
	}
	return true, nil
}
