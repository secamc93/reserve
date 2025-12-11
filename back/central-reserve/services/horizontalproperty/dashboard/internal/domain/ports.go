package domain

import "context"

// DashboardRepository define los métodos para obtener datos del dashboard
type DashboardRepository interface {
	// GetDashboardSummary obtiene el resumen general del dashboard para un business
	GetDashboardSummary(ctx context.Context, businessID uint) (*DashboardSummary, error)

	// GetVotingStatistics obtiene estadísticas de votaciones
	GetVotingStatistics(ctx context.Context, businessID uint) (*VotingStatistics, error)

	// GetAttendanceStatistics obtiene estadísticas de asistencia
	GetAttendanceStatistics(ctx context.Context, businessID uint) (*AttendanceStatistics, error)

	// GetBusinessSummaries obtiene resúmenes de todos los businesses (solo para super admin) con paginación
	GetBusinessSummaries(ctx context.Context, page, pageSize int) ([]BusinessSummary, int64, error)

	// GetBusinessSummary obtiene resumen de un business específico
	GetBusinessSummary(ctx context.Context, businessID uint) (*BusinessSummary, error)
}

// DashboardUseCase define los casos de uso del dashboard
type DashboardUseCase interface {
	// GetDashboard obtiene el dashboard completo según el tipo de usuario
	GetDashboard(ctx context.Context, businessID uint, isSuperAdmin bool, page, pageSize int) (*DashboardResponseDTO, error)

	// GetDashboardByBusiness obtiene el dashboard de un business específico (solo super admin)
	GetDashboardByBusiness(ctx context.Context, businessID uint) (*DashboardResponseDTO, error)
}
