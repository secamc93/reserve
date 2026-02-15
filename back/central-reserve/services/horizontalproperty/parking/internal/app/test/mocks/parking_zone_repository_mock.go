package mocks

import (
	"context"

	"central_reserve/services/horizontalproperty/parking/internal/domain"
)

// ParkingZoneRepositoryMock - Mock del repositorio de zonas de parqueo
type ParkingZoneRepositoryMock struct {
	CreateParkingZoneFn            func(ctx context.Context, zone *domain.ParkingZone) (*domain.ParkingZone, error)
	GetParkingZoneByIDFn           func(ctx context.Context, id uint) (*domain.ParkingZone, error)
	UpdateParkingZoneFn            func(ctx context.Context, zone *domain.ParkingZone) error
	DeleteParkingZoneFn            func(ctx context.Context, id uint) error
	ListParkingZonesFn             func(ctx context.Context, filters domain.ParkingZoneFiltersDTO) (*domain.PaginatedParkingZonesDTO, error)
	GetParkingZonesByBusinessIDFn  func(ctx context.Context, businessID uint) ([]*domain.ParkingZone, error)
}

func (m *ParkingZoneRepositoryMock) CreateParkingZone(ctx context.Context, zone *domain.ParkingZone) (*domain.ParkingZone, error) {
	if m.CreateParkingZoneFn != nil {
		return m.CreateParkingZoneFn(ctx, zone)
	}
	return zone, nil
}

func (m *ParkingZoneRepositoryMock) GetParkingZoneByID(ctx context.Context, id uint) (*domain.ParkingZone, error) {
	if m.GetParkingZoneByIDFn != nil {
		return m.GetParkingZoneByIDFn(ctx, id)
	}
	return nil, nil
}

func (m *ParkingZoneRepositoryMock) UpdateParkingZone(ctx context.Context, zone *domain.ParkingZone) error {
	if m.UpdateParkingZoneFn != nil {
		return m.UpdateParkingZoneFn(ctx, zone)
	}
	return nil
}

func (m *ParkingZoneRepositoryMock) DeleteParkingZone(ctx context.Context, id uint) error {
	if m.DeleteParkingZoneFn != nil {
		return m.DeleteParkingZoneFn(ctx, id)
	}
	return nil
}

func (m *ParkingZoneRepositoryMock) ListParkingZones(ctx context.Context, filters domain.ParkingZoneFiltersDTO) (*domain.PaginatedParkingZonesDTO, error) {
	if m.ListParkingZonesFn != nil {
		return m.ListParkingZonesFn(ctx, filters)
	}
	return &domain.PaginatedParkingZonesDTO{}, nil
}

func (m *ParkingZoneRepositoryMock) GetParkingZonesByBusinessID(ctx context.Context, businessID uint) ([]*domain.ParkingZone, error) {
	if m.GetParkingZonesByBusinessIDFn != nil {
		return m.GetParkingZonesByBusinessIDFn(ctx, businessID)
	}
	return []*domain.ParkingZone{}, nil
}
