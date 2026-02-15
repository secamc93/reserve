package mocks

import (
	"context"

	"central_reserve/services/sporttraining/catalog/internal/domain"
)

// MockCatalogRepository - Mock del repositorio de catálogos
type MockCatalogRepository struct {
	GetSkillLevelsFunc        func(ctx context.Context) ([]domain.PlayerSkillLevel, error)
	GetCoachSpecialtiesFunc   func(ctx context.Context) ([]domain.CoachSpecialty, error)
	GetSessionTypesFunc       func(ctx context.Context) ([]domain.TrainingSessionType, error)
	GetBookingStatusesFunc    func(ctx context.Context) ([]domain.BookingStatus, error)
	GetAttendanceStatusesFunc func(ctx context.Context) ([]domain.AttendanceStatus, error)
}

func (m *MockCatalogRepository) GetSkillLevels(ctx context.Context) ([]domain.PlayerSkillLevel, error) {
	if m.GetSkillLevelsFunc != nil {
		return m.GetSkillLevelsFunc(ctx)
	}
	return nil, nil
}

func (m *MockCatalogRepository) GetCoachSpecialties(ctx context.Context) ([]domain.CoachSpecialty, error) {
	if m.GetCoachSpecialtiesFunc != nil {
		return m.GetCoachSpecialtiesFunc(ctx)
	}
	return nil, nil
}

func (m *MockCatalogRepository) GetSessionTypes(ctx context.Context) ([]domain.TrainingSessionType, error) {
	if m.GetSessionTypesFunc != nil {
		return m.GetSessionTypesFunc(ctx)
	}
	return nil, nil
}

func (m *MockCatalogRepository) GetBookingStatuses(ctx context.Context) ([]domain.BookingStatus, error) {
	if m.GetBookingStatusesFunc != nil {
		return m.GetBookingStatusesFunc(ctx)
	}
	return nil, nil
}

func (m *MockCatalogRepository) GetAttendanceStatuses(ctx context.Context) ([]domain.AttendanceStatus, error) {
	if m.GetAttendanceStatusesFunc != nil {
		return m.GetAttendanceStatusesFunc(ctx)
	}
	return nil, nil
}
