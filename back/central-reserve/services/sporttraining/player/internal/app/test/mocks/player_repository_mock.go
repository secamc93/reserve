package mocks

import (
	"context"

	"central_reserve/services/sporttraining/player/internal/domain"
)

// MockPlayerRepository - Mock del repositorio de jugadores
type MockPlayerRepository struct {
	CreateFunc    func(ctx context.Context, player *domain.Player) (*domain.Player, error)
	GetByIDFunc   func(ctx context.Context, id uint, businessID uint) (*domain.Player, error)
	UpdateFunc    func(ctx context.Context, player *domain.Player) (*domain.Player, error)
	DeleteFunc    func(ctx context.Context, id uint, businessID uint) error
	ListFunc      func(ctx context.Context, filters domain.PlayerFiltersDTO) (*domain.PaginatedPlayersDTO, error)
}

func (m *MockPlayerRepository) Create(ctx context.Context, player *domain.Player) (*domain.Player, error) {
	if m.CreateFunc != nil {
		return m.CreateFunc(ctx, player)
	}
	return nil, nil
}

func (m *MockPlayerRepository) GetByID(ctx context.Context, id uint, businessID uint) (*domain.Player, error) {
	if m.GetByIDFunc != nil {
		return m.GetByIDFunc(ctx, id, businessID)
	}
	return nil, nil
}

func (m *MockPlayerRepository) Update(ctx context.Context, player *domain.Player) (*domain.Player, error) {
	if m.UpdateFunc != nil {
		return m.UpdateFunc(ctx, player)
	}
	return nil, nil
}

func (m *MockPlayerRepository) Delete(ctx context.Context, id uint, businessID uint) error {
	if m.DeleteFunc != nil {
		return m.DeleteFunc(ctx, id, businessID)
	}
	return nil
}

func (m *MockPlayerRepository) List(ctx context.Context, filters domain.PlayerFiltersDTO) (*domain.PaginatedPlayersDTO, error) {
	if m.ListFunc != nil {
		return m.ListFunc(ctx, filters)
	}
	return nil, nil
}
