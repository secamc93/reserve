package mocks

import (
	"context"

	"central_reserve/services/horizontalproperty/parking/internal/domain"
)

// ParkingTypeRepositoryMock - Mock del repositorio de tipos de parqueo
type ParkingTypeRepositoryMock struct {
	GetAllParkingTypesFn    func(ctx context.Context) ([]*domain.ParkingType, error)
	GetActiveParkingTypesFn func(ctx context.Context) ([]*domain.ParkingType, error)
	GetParkingTypeByIDFn    func(ctx context.Context, id uint) (*domain.ParkingType, error)
}

func (m *ParkingTypeRepositoryMock) GetAllParkingTypes(ctx context.Context) ([]*domain.ParkingType, error) {
	if m.GetAllParkingTypesFn != nil {
		return m.GetAllParkingTypesFn(ctx)
	}
	return []*domain.ParkingType{}, nil
}

func (m *ParkingTypeRepositoryMock) GetActiveParkingTypes(ctx context.Context) ([]*domain.ParkingType, error) {
	if m.GetActiveParkingTypesFn != nil {
		return m.GetActiveParkingTypesFn(ctx)
	}
	return []*domain.ParkingType{}, nil
}

func (m *ParkingTypeRepositoryMock) GetParkingTypeByID(ctx context.Context, id uint) (*domain.ParkingType, error) {
	if m.GetParkingTypeByIDFn != nil {
		return m.GetParkingTypeByIDFn(ctx, id)
	}
	return nil, nil
}
