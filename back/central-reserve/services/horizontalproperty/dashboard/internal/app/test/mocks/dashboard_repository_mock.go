package mocks

import (
	"context"

	"central_reserve/services/horizontalproperty/dashboard/internal/domain"
)

// DashboardRepositoryMock es un mock del repositorio de dashboard
type DashboardRepositoryMock struct {
	GetDashboardSummaryFunc     func(ctx context.Context, businessID uint) (*domain.DashboardSummary, error)
	GetVotingStatisticsFunc     func(ctx context.Context, businessID uint) (*domain.VotingStatistics, error)
	GetAttendanceStatisticsFunc func(ctx context.Context, businessID uint) (*domain.AttendanceStatistics, error)
	GetBusinessSummariesFunc    func(ctx context.Context, page, pageSize int) ([]domain.BusinessSummary, int64, error)
	GetBusinessSummaryFunc      func(ctx context.Context, businessID uint) (*domain.BusinessSummary, error)
}

// GetDashboardSummary obtiene el resumen general del dashboard para un business
func (m *DashboardRepositoryMock) GetDashboardSummary(ctx context.Context, businessID uint) (*domain.DashboardSummary, error) {
	if m.GetDashboardSummaryFunc != nil {
		return m.GetDashboardSummaryFunc(ctx, businessID)
	}
	return &domain.DashboardSummary{}, nil
}

// GetVotingStatistics obtiene estadísticas de votaciones
func (m *DashboardRepositoryMock) GetVotingStatistics(ctx context.Context, businessID uint) (*domain.VotingStatistics, error) {
	if m.GetVotingStatisticsFunc != nil {
		return m.GetVotingStatisticsFunc(ctx, businessID)
	}
	return &domain.VotingStatistics{}, nil
}

// GetAttendanceStatistics obtiene estadísticas de asistencia
func (m *DashboardRepositoryMock) GetAttendanceStatistics(ctx context.Context, businessID uint) (*domain.AttendanceStatistics, error) {
	if m.GetAttendanceStatisticsFunc != nil {
		return m.GetAttendanceStatisticsFunc(ctx, businessID)
	}
	return &domain.AttendanceStatistics{}, nil
}

// GetBusinessSummaries obtiene resúmenes de todos los businesses (solo para super admin) con paginación
func (m *DashboardRepositoryMock) GetBusinessSummaries(ctx context.Context, page, pageSize int) ([]domain.BusinessSummary, int64, error) {
	if m.GetBusinessSummariesFunc != nil {
		return m.GetBusinessSummariesFunc(ctx, page, pageSize)
	}
	return []domain.BusinessSummary{}, 0, nil
}

// GetBusinessSummary obtiene resumen de un business específico
func (m *DashboardRepositoryMock) GetBusinessSummary(ctx context.Context, businessID uint) (*domain.BusinessSummary, error) {
	if m.GetBusinessSummaryFunc != nil {
		return m.GetBusinessSummaryFunc(ctx, businessID)
	}
	return &domain.BusinessSummary{}, nil
}
