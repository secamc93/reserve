package mocks

import (
	"context"

	"central_reserve/services/sporttraining/session/internal/domain"
)

// MockSessionRepository - Mock del repositorio de sesiones
type MockSessionRepository struct {
	CreateFunc  func(ctx context.Context, session *domain.TrainingSession) (*domain.TrainingSession, error)
	GetByIDFunc func(ctx context.Context, id uint, businessID uint) (*domain.TrainingSession, error)
	UpdateFunc  func(ctx context.Context, session *domain.TrainingSession) (*domain.TrainingSession, error)
	ListFunc    func(ctx context.Context, filters domain.SessionFiltersDTO) (*domain.PaginatedSessionsDTO, error)
	CancelFunc  func(ctx context.Context, dto domain.CancelSessionDTO) (*domain.TrainingSession, error)
}

func (m *MockSessionRepository) Create(ctx context.Context, session *domain.TrainingSession) (*domain.TrainingSession, error) {
	if m.CreateFunc != nil {
		return m.CreateFunc(ctx, session)
	}
	return nil, nil
}

func (m *MockSessionRepository) GetByID(ctx context.Context, id uint, businessID uint) (*domain.TrainingSession, error) {
	if m.GetByIDFunc != nil {
		return m.GetByIDFunc(ctx, id, businessID)
	}
	return nil, nil
}

func (m *MockSessionRepository) Update(ctx context.Context, session *domain.TrainingSession) (*domain.TrainingSession, error) {
	if m.UpdateFunc != nil {
		return m.UpdateFunc(ctx, session)
	}
	return nil, nil
}

func (m *MockSessionRepository) List(ctx context.Context, filters domain.SessionFiltersDTO) (*domain.PaginatedSessionsDTO, error) {
	if m.ListFunc != nil {
		return m.ListFunc(ctx, filters)
	}
	return nil, nil
}

func (m *MockSessionRepository) Cancel(ctx context.Context, dto domain.CancelSessionDTO) (*domain.TrainingSession, error) {
	if m.CancelFunc != nil {
		return m.CancelFunc(ctx, dto)
	}
	return nil, nil
}
