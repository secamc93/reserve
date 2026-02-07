package mocks

import (
	"context"

	"central_reserve/services/sporttraining/guardian/internal/domain"
)

// MockGuardianRepository - Mock del repositorio de tutores
type MockGuardianRepository struct {
	CreateFunc            func(ctx context.Context, guardian *domain.Guardian) (*domain.Guardian, error)
	GetByIDFunc           func(ctx context.Context, id uint, businessID uint) (*domain.Guardian, error)
	UpdateFunc            func(ctx context.Context, guardian *domain.Guardian) (*domain.Guardian, error)
	ListFunc              func(ctx context.Context, filters domain.GuardianFiltersDTO) (*domain.PaginatedGuardiansDTO, error)
	AssignToPlayerFunc    func(ctx context.Context, assignment *domain.PlayerGuardianAssignment) error
	GetPlayerGuardiansFunc func(ctx context.Context, playerID uint, businessID uint) ([]domain.PlayerGuardianDTO, error)
}

func (m *MockGuardianRepository) Create(ctx context.Context, guardian *domain.Guardian) (*domain.Guardian, error) {
	if m.CreateFunc != nil {
		return m.CreateFunc(ctx, guardian)
	}
	return nil, nil
}

func (m *MockGuardianRepository) GetByID(ctx context.Context, id uint, businessID uint) (*domain.Guardian, error) {
	if m.GetByIDFunc != nil {
		return m.GetByIDFunc(ctx, id, businessID)
	}
	return nil, nil
}

func (m *MockGuardianRepository) Update(ctx context.Context, guardian *domain.Guardian) (*domain.Guardian, error) {
	if m.UpdateFunc != nil {
		return m.UpdateFunc(ctx, guardian)
	}
	return nil, nil
}

func (m *MockGuardianRepository) List(ctx context.Context, filters domain.GuardianFiltersDTO) (*domain.PaginatedGuardiansDTO, error) {
	if m.ListFunc != nil {
		return m.ListFunc(ctx, filters)
	}
	return nil, nil
}

func (m *MockGuardianRepository) AssignToPlayer(ctx context.Context, assignment *domain.PlayerGuardianAssignment) error {
	if m.AssignToPlayerFunc != nil {
		return m.AssignToPlayerFunc(ctx, assignment)
	}
	return nil
}

func (m *MockGuardianRepository) GetPlayerGuardians(ctx context.Context, playerID uint, businessID uint) ([]domain.PlayerGuardianDTO, error) {
	if m.GetPlayerGuardiansFunc != nil {
		return m.GetPlayerGuardiansFunc(ctx, playerID, businessID)
	}
	return nil, nil
}
