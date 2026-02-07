package mocks

import (
	"context"

	"central_reserve/services/sporttraining/attendance/internal/domain"
)

// MockAttendanceRepository - Mock del repositorio de asistencia
type MockAttendanceRepository struct {
	CreateFunc        func(ctx context.Context, record *domain.AttendanceRecord) (*domain.AttendanceRecord, error)
	ListBySessionFunc func(ctx context.Context, filters domain.AttendanceFiltersDTO) (*domain.PaginatedAttendanceDTO, error)
	ListByPlayerFunc  func(ctx context.Context, filters domain.AttendanceFiltersDTO) (*domain.PaginatedAttendanceDTO, error)
}

func (m *MockAttendanceRepository) Create(ctx context.Context, record *domain.AttendanceRecord) (*domain.AttendanceRecord, error) {
	if m.CreateFunc != nil {
		return m.CreateFunc(ctx, record)
	}
	return nil, nil
}

func (m *MockAttendanceRepository) ListBySession(ctx context.Context, filters domain.AttendanceFiltersDTO) (*domain.PaginatedAttendanceDTO, error) {
	if m.ListBySessionFunc != nil {
		return m.ListBySessionFunc(ctx, filters)
	}
	return nil, nil
}

func (m *MockAttendanceRepository) ListByPlayer(ctx context.Context, filters domain.AttendanceFiltersDTO) (*domain.PaginatedAttendanceDTO, error) {
	if m.ListByPlayerFunc != nil {
		return m.ListByPlayerFunc(ctx, filters)
	}
	return nil, nil
}
