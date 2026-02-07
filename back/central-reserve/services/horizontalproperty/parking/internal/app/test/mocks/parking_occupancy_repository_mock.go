package mocks

import (
	"context"

	"central_reserve/services/horizontalproperty/parking/internal/domain"
)

// ParkingOccupancyRepositoryMock - Mock del repositorio de ocupaciones de parqueo
type ParkingOccupancyRepositoryMock struct {
	CreateParkingOccupancyFn      func(ctx context.Context, occupancy *domain.ParkingOccupancy) (*domain.ParkingOccupancy, error)
	GetParkingOccupancyByIDFn     func(ctx context.Context, id uint) (*domain.ParkingOccupancy, error)
	UpdateParkingOccupancyFn      func(ctx context.Context, occupancy *domain.ParkingOccupancy) error
	GetActiveOccupancyBySlotIDFn  func(ctx context.Context, slotID uint) (*domain.ParkingOccupancy, error)
	GetOccupanciesBySlotIDFn      func(ctx context.Context, slotID uint, startDate, endDate string) ([]*domain.ParkingOccupancy, error)
}

func (m *ParkingOccupancyRepositoryMock) CreateParkingOccupancy(ctx context.Context, occupancy *domain.ParkingOccupancy) (*domain.ParkingOccupancy, error) {
	if m.CreateParkingOccupancyFn != nil {
		return m.CreateParkingOccupancyFn(ctx, occupancy)
	}
	return occupancy, nil
}

func (m *ParkingOccupancyRepositoryMock) GetParkingOccupancyByID(ctx context.Context, id uint) (*domain.ParkingOccupancy, error) {
	if m.GetParkingOccupancyByIDFn != nil {
		return m.GetParkingOccupancyByIDFn(ctx, id)
	}
	return nil, nil
}

func (m *ParkingOccupancyRepositoryMock) UpdateParkingOccupancy(ctx context.Context, occupancy *domain.ParkingOccupancy) error {
	if m.UpdateParkingOccupancyFn != nil {
		return m.UpdateParkingOccupancyFn(ctx, occupancy)
	}
	return nil
}

func (m *ParkingOccupancyRepositoryMock) GetActiveOccupancyBySlotID(ctx context.Context, slotID uint) (*domain.ParkingOccupancy, error) {
	if m.GetActiveOccupancyBySlotIDFn != nil {
		return m.GetActiveOccupancyBySlotIDFn(ctx, slotID)
	}
	return nil, nil
}

func (m *ParkingOccupancyRepositoryMock) GetOccupanciesBySlotID(ctx context.Context, slotID uint, startDate, endDate string) ([]*domain.ParkingOccupancy, error) {
	if m.GetOccupanciesBySlotIDFn != nil {
		return m.GetOccupanciesBySlotIDFn(ctx, slotID, startDate, endDate)
	}
	return []*domain.ParkingOccupancy{}, nil
}
