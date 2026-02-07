package mocks

import (
	"context"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
)

// MockVisitCompanionRepository es un mock del VisitCompanionRepository
type MockVisitCompanionRepository struct {
	CreateCompanionFunc         func(ctx context.Context, companion *domain.VisitCompanion) (*domain.VisitCompanion, error)
	GetCompanionsByVisitIDFunc  func(ctx context.Context, visitID uint) ([]*domain.VisitCompanion, error)
	UpdateCompanionFunc         func(ctx context.Context, companion *domain.VisitCompanion) error
	DeleteCompanionFunc         func(ctx context.Context, id uint) error
}

func (m *MockVisitCompanionRepository) CreateCompanion(ctx context.Context, companion *domain.VisitCompanion) (*domain.VisitCompanion, error) {
	if m.CreateCompanionFunc != nil {
		return m.CreateCompanionFunc(ctx, companion)
	}
	return nil, nil
}

func (m *MockVisitCompanionRepository) GetCompanionsByVisitID(ctx context.Context, visitID uint) ([]*domain.VisitCompanion, error) {
	if m.GetCompanionsByVisitIDFunc != nil {
		return m.GetCompanionsByVisitIDFunc(ctx, visitID)
	}
	return nil, nil
}

func (m *MockVisitCompanionRepository) UpdateCompanion(ctx context.Context, companion *domain.VisitCompanion) error {
	if m.UpdateCompanionFunc != nil {
		return m.UpdateCompanionFunc(ctx, companion)
	}
	return nil
}

func (m *MockVisitCompanionRepository) DeleteCompanion(ctx context.Context, id uint) error {
	if m.DeleteCompanionFunc != nil {
		return m.DeleteCompanionFunc(ctx, id)
	}
	return nil
}
