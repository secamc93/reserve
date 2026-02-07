package mocks

import (
	"context"

	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
)

// MockScheduleRepository - Mock del repositorio de horarios
type MockScheduleRepository struct {
	CreateScheduleFunc             func(ctx context.Context, schedule *domain.CommonAreaSchedule) (*domain.CommonAreaSchedule, error)
	GetSchedulesByCommonAreaIDFunc func(ctx context.Context, commonAreaID uint) ([]*domain.CommonAreaSchedule, error)
	UpdateScheduleFunc             func(ctx context.Context, schedule *domain.CommonAreaSchedule) error
	DeleteScheduleFunc             func(ctx context.Context, id uint) error
	GetScheduleForDayFunc          func(ctx context.Context, commonAreaID uint, dayOfWeek int) (*domain.CommonAreaSchedule, error)
}

func (m *MockScheduleRepository) CreateSchedule(ctx context.Context, schedule *domain.CommonAreaSchedule) (*domain.CommonAreaSchedule, error) {
	if m.CreateScheduleFunc != nil {
		return m.CreateScheduleFunc(ctx, schedule)
	}
	return nil, nil
}

func (m *MockScheduleRepository) GetSchedulesByCommonAreaID(ctx context.Context, commonAreaID uint) ([]*domain.CommonAreaSchedule, error) {
	if m.GetSchedulesByCommonAreaIDFunc != nil {
		return m.GetSchedulesByCommonAreaIDFunc(ctx, commonAreaID)
	}
	return nil, nil
}

func (m *MockScheduleRepository) UpdateSchedule(ctx context.Context, schedule *domain.CommonAreaSchedule) error {
	if m.UpdateScheduleFunc != nil {
		return m.UpdateScheduleFunc(ctx, schedule)
	}
	return nil
}

func (m *MockScheduleRepository) DeleteSchedule(ctx context.Context, id uint) error {
	if m.DeleteScheduleFunc != nil {
		return m.DeleteScheduleFunc(ctx, id)
	}
	return nil
}

func (m *MockScheduleRepository) GetScheduleForDay(ctx context.Context, commonAreaID uint, dayOfWeek int) (*domain.CommonAreaSchedule, error) {
	if m.GetScheduleForDayFunc != nil {
		return m.GetScheduleForDayFunc(ctx, commonAreaID, dayOfWeek)
	}
	return nil, nil
}
