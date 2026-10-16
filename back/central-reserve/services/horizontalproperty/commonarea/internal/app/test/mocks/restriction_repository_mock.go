package mocks

import (
	"context"
	"time"

	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
)

// MockRestrictionRepository - Mock del repositorio de restricciones
type MockRestrictionRepository struct {
	CreateRestrictionFunc     func(ctx context.Context, restriction *domain.CommonAreaRestriction) (*domain.CommonAreaRestriction, error)
	GetActiveRestrictionsFunc func(ctx context.Context, commonAreaID uint, date time.Time, startTime, endTime string) ([]*domain.CommonAreaRestriction, error)
	DeleteRestrictionFunc     func(ctx context.Context, id uint) error
	GetRestrictionByIDFunc    func(ctx context.Context, id uint) (*domain.CommonAreaRestriction, error)
	ListRestrictionsFunc      func(ctx context.Context, commonAreaID uint, fromDate time.Time) ([]*domain.CommonAreaRestriction, error)
}

func (m *MockRestrictionRepository) CreateRestriction(ctx context.Context, restriction *domain.CommonAreaRestriction) (*domain.CommonAreaRestriction, error) {
	if m.CreateRestrictionFunc != nil {
		return m.CreateRestrictionFunc(ctx, restriction)
	}
	return nil, nil
}

func (m *MockRestrictionRepository) GetActiveRestrictions(ctx context.Context, commonAreaID uint, date time.Time, startTime, endTime string) ([]*domain.CommonAreaRestriction, error) {
	if m.GetActiveRestrictionsFunc != nil {
		return m.GetActiveRestrictionsFunc(ctx, commonAreaID, date, startTime, endTime)
	}
	return nil, nil
}

func (m *MockRestrictionRepository) DeleteRestriction(ctx context.Context, id uint) error {
	if m.DeleteRestrictionFunc != nil {
		return m.DeleteRestrictionFunc(ctx, id)
	}
	return nil
}

func (m *MockRestrictionRepository) GetRestrictionByID(ctx context.Context, id uint) (*domain.CommonAreaRestriction, error) {
	if m.GetRestrictionByIDFunc != nil {
		return m.GetRestrictionByIDFunc(ctx, id)
	}
	return nil, nil
}

func (m *MockRestrictionRepository) ListRestrictions(ctx context.Context, commonAreaID uint, fromDate time.Time) ([]*domain.CommonAreaRestriction, error) {
	if m.ListRestrictionsFunc != nil {
		return m.ListRestrictionsFunc(ctx, commonAreaID, fromDate)
	}
	return nil, nil
}
