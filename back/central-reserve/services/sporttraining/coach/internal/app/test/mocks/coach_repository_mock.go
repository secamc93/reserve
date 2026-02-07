package mocks

import (
	"context"

	"central_reserve/services/sporttraining/coach/internal/domain"
)

// MockCoachRepository - Mock del repositorio de entrenadores
type MockCoachRepository struct {
	CreateFunc           func(ctx context.Context, coach *domain.Coach) (*domain.Coach, error)
	GetByIDFunc          func(ctx context.Context, id uint, businessID uint) (*domain.Coach, error)
	UpdateFunc           func(ctx context.Context, coach *domain.Coach) (*domain.Coach, error)
	ListFunc             func(ctx context.Context, filters domain.CoachFiltersDTO) (*domain.PaginatedCoachesDTO, error)
	AssignSpecialtyFunc  func(ctx context.Context, dto domain.AssignSpecialtyDTO) error
	GetSpecialtiesFunc   func(ctx context.Context, coachID uint, businessID uint) ([]domain.SpecialtyAssignment, error)
}

func (m *MockCoachRepository) Create(ctx context.Context, coach *domain.Coach) (*domain.Coach, error) {
	if m.CreateFunc != nil {
		return m.CreateFunc(ctx, coach)
	}
	return nil, nil
}

func (m *MockCoachRepository) GetByID(ctx context.Context, id uint, businessID uint) (*domain.Coach, error) {
	if m.GetByIDFunc != nil {
		return m.GetByIDFunc(ctx, id, businessID)
	}
	return nil, nil
}

func (m *MockCoachRepository) Update(ctx context.Context, coach *domain.Coach) (*domain.Coach, error) {
	if m.UpdateFunc != nil {
		return m.UpdateFunc(ctx, coach)
	}
	return nil, nil
}

func (m *MockCoachRepository) List(ctx context.Context, filters domain.CoachFiltersDTO) (*domain.PaginatedCoachesDTO, error) {
	if m.ListFunc != nil {
		return m.ListFunc(ctx, filters)
	}
	return nil, nil
}

func (m *MockCoachRepository) AssignSpecialty(ctx context.Context, dto domain.AssignSpecialtyDTO) error {
	if m.AssignSpecialtyFunc != nil {
		return m.AssignSpecialtyFunc(ctx, dto)
	}
	return nil
}

func (m *MockCoachRepository) GetSpecialties(ctx context.Context, coachID uint, businessID uint) ([]domain.SpecialtyAssignment, error) {
	if m.GetSpecialtiesFunc != nil {
		return m.GetSpecialtiesFunc(ctx, coachID, businessID)
	}
	return nil, nil
}
