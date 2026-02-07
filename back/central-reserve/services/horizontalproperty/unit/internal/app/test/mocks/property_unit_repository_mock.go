package mocks

import (
	"context"

	"central_reserve/services/horizontalproperty/unit/internal/domain"
)

// MockPropertyUnitRepository es un mock del PropertyUnitRepository
type MockPropertyUnitRepository struct {
	CreatePropertyUnitFunc         func(ctx context.Context, unit *domain.PropertyUnit) (*domain.PropertyUnit, error)
	GetPropertyUnitByIDFunc        func(ctx context.Context, id uint) (*domain.PropertyUnit, error)
	ListPropertyUnitsFunc          func(ctx context.Context, filters domain.PropertyUnitFiltersDTO) (*domain.PaginatedPropertyUnitsDTO, error)
	UpdatePropertyUnitFunc         func(ctx context.Context, id uint, unit *domain.PropertyUnit) (*domain.PropertyUnit, error)
	DeletePropertyUnitFunc         func(ctx context.Context, id uint) error
	ExistsPropertyUnitByNumberFunc func(ctx context.Context, businessID uint, number string, excludeID uint) (bool, error)
}

func (m *MockPropertyUnitRepository) CreatePropertyUnit(ctx context.Context, unit *domain.PropertyUnit) (*domain.PropertyUnit, error) {
	if m.CreatePropertyUnitFunc != nil {
		return m.CreatePropertyUnitFunc(ctx, unit)
	}
	return unit, nil
}

func (m *MockPropertyUnitRepository) GetPropertyUnitByID(ctx context.Context, id uint) (*domain.PropertyUnit, error) {
	if m.GetPropertyUnitByIDFunc != nil {
		return m.GetPropertyUnitByIDFunc(ctx, id)
	}
	return nil, nil
}

func (m *MockPropertyUnitRepository) ListPropertyUnits(ctx context.Context, filters domain.PropertyUnitFiltersDTO) (*domain.PaginatedPropertyUnitsDTO, error) {
	if m.ListPropertyUnitsFunc != nil {
		return m.ListPropertyUnitsFunc(ctx, filters)
	}
	return &domain.PaginatedPropertyUnitsDTO{
		Units:      []domain.PropertyUnitListDTO{},
		Total:      0,
		Page:       filters.Page,
		PageSize:   filters.PageSize,
		TotalPages: 0,
	}, nil
}

func (m *MockPropertyUnitRepository) UpdatePropertyUnit(ctx context.Context, id uint, unit *domain.PropertyUnit) (*domain.PropertyUnit, error) {
	if m.UpdatePropertyUnitFunc != nil {
		return m.UpdatePropertyUnitFunc(ctx, id, unit)
	}
	return unit, nil
}

func (m *MockPropertyUnitRepository) DeletePropertyUnit(ctx context.Context, id uint) error {
	if m.DeletePropertyUnitFunc != nil {
		return m.DeletePropertyUnitFunc(ctx, id)
	}
	return nil
}

func (m *MockPropertyUnitRepository) ExistsPropertyUnitByNumber(ctx context.Context, businessID uint, number string, excludeID uint) (bool, error) {
	if m.ExistsPropertyUnitByNumberFunc != nil {
		return m.ExistsPropertyUnitByNumberFunc(ctx, businessID, number, excludeID)
	}
	return false, nil
}
