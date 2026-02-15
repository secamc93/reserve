package mocks

import (
	"context"

	"central_reserve/services/sporttraining/traininggroup/internal/domain"
)

// MockGroupRepository - Mock del repositorio de grupos de entrenamiento
type MockGroupRepository struct {
	CreateFunc           func(ctx context.Context, group *domain.TrainingGroup) (*domain.TrainingGroup, error)
	GetByIDFunc          func(ctx context.Context, id uint, businessID uint) (*domain.TrainingGroup, error)
	UpdateFunc           func(ctx context.Context, group *domain.TrainingGroup) (*domain.TrainingGroup, error)
	ListFunc             func(ctx context.Context, filters domain.GroupFiltersDTO) (*domain.PaginatedGroupsDTO, error)
	AddPlayerFunc        func(ctx context.Context, dto domain.AddPlayerDTO) error
	RemovePlayerFunc     func(ctx context.Context, groupID uint, playerID uint, businessID uint) error
	GetGroupPlayersFunc  func(ctx context.Context, groupID uint, businessID uint) ([]domain.GroupPlayerDTO, error)
}

func (m *MockGroupRepository) Create(ctx context.Context, group *domain.TrainingGroup) (*domain.TrainingGroup, error) {
	if m.CreateFunc != nil {
		return m.CreateFunc(ctx, group)
	}
	return nil, nil
}

func (m *MockGroupRepository) GetByID(ctx context.Context, id uint, businessID uint) (*domain.TrainingGroup, error) {
	if m.GetByIDFunc != nil {
		return m.GetByIDFunc(ctx, id, businessID)
	}
	return nil, nil
}

func (m *MockGroupRepository) Update(ctx context.Context, group *domain.TrainingGroup) (*domain.TrainingGroup, error) {
	if m.UpdateFunc != nil {
		return m.UpdateFunc(ctx, group)
	}
	return nil, nil
}

func (m *MockGroupRepository) List(ctx context.Context, filters domain.GroupFiltersDTO) (*domain.PaginatedGroupsDTO, error) {
	if m.ListFunc != nil {
		return m.ListFunc(ctx, filters)
	}
	return nil, nil
}

func (m *MockGroupRepository) AddPlayer(ctx context.Context, dto domain.AddPlayerDTO) error {
	if m.AddPlayerFunc != nil {
		return m.AddPlayerFunc(ctx, dto)
	}
	return nil
}

func (m *MockGroupRepository) RemovePlayer(ctx context.Context, groupID uint, playerID uint, businessID uint) error {
	if m.RemovePlayerFunc != nil {
		return m.RemovePlayerFunc(ctx, groupID, playerID, businessID)
	}
	return nil
}

func (m *MockGroupRepository) GetGroupPlayers(ctx context.Context, groupID uint, businessID uint) ([]domain.GroupPlayerDTO, error) {
	if m.GetGroupPlayersFunc != nil {
		return m.GetGroupPlayersFunc(ctx, groupID, businessID)
	}
	return nil, nil
}
