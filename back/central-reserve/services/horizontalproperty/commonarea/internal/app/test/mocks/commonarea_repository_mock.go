package mocks

import (
	"context"

	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
)

// MockCommonAreaRepository - Mock del repositorio de zonas comunes
type MockCommonAreaRepository struct {
	CreateCommonAreaFunc           func(ctx context.Context, area *domain.CommonArea) (*domain.CommonArea, error)
	GetCommonAreaByIDFunc          func(ctx context.Context, id uint) (*domain.CommonArea, error)
	UpdateCommonAreaFunc           func(ctx context.Context, area *domain.CommonArea) error
	DeleteCommonAreaFunc           func(ctx context.Context, id uint) error
	ListCommonAreasFunc            func(ctx context.Context, filters domain.CommonAreaFiltersDTO) (*domain.PaginatedCommonAreasDTO, error)
	GetCommonAreasByBusinessIDFunc func(ctx context.Context, businessID uint) ([]*domain.CommonArea, error)
	GetCommonAreaTypesFunc         func(ctx context.Context) ([]*domain.CommonAreaType, error)
}

func (m *MockCommonAreaRepository) CreateCommonArea(ctx context.Context, area *domain.CommonArea) (*domain.CommonArea, error) {
	if m.CreateCommonAreaFunc != nil {
		return m.CreateCommonAreaFunc(ctx, area)
	}
	return nil, nil
}

func (m *MockCommonAreaRepository) GetCommonAreaByID(ctx context.Context, id uint) (*domain.CommonArea, error) {
	if m.GetCommonAreaByIDFunc != nil {
		return m.GetCommonAreaByIDFunc(ctx, id)
	}
	return nil, nil
}

func (m *MockCommonAreaRepository) UpdateCommonArea(ctx context.Context, area *domain.CommonArea) error {
	if m.UpdateCommonAreaFunc != nil {
		return m.UpdateCommonAreaFunc(ctx, area)
	}
	return nil
}

func (m *MockCommonAreaRepository) DeleteCommonArea(ctx context.Context, id uint) error {
	if m.DeleteCommonAreaFunc != nil {
		return m.DeleteCommonAreaFunc(ctx, id)
	}
	return nil
}

func (m *MockCommonAreaRepository) ListCommonAreas(ctx context.Context, filters domain.CommonAreaFiltersDTO) (*domain.PaginatedCommonAreasDTO, error) {
	if m.ListCommonAreasFunc != nil {
		return m.ListCommonAreasFunc(ctx, filters)
	}
	return nil, nil
}

func (m *MockCommonAreaRepository) GetCommonAreasByBusinessID(ctx context.Context, businessID uint) ([]*domain.CommonArea, error) {
	if m.GetCommonAreasByBusinessIDFunc != nil {
		return m.GetCommonAreasByBusinessIDFunc(ctx, businessID)
	}
	return nil, nil
}

func (m *MockCommonAreaRepository) GetCommonAreaTypes(ctx context.Context) ([]*domain.CommonAreaType, error) {
	if m.GetCommonAreaTypesFunc != nil {
		return m.GetCommonAreaTypesFunc(ctx)
	}
	return nil, nil
}
