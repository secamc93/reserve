package app

import (
	"central_reserve/services/auth/dashboard/internal/domain"
	"context"
)

// GetDashboardStats obtiene las estadísticas del dashboard IAM
func (uc *DashboardUseCase) GetDashboardStats(ctx context.Context, businessTypeID *uint, businessID *uint) (*domain.DashboardStats, error) {
	uc.log.Info().
		Interface("business_type_id", businessTypeID).
		Interface("business_id", businessID).
		Msg("Iniciando caso de uso: obtener estadísticas del dashboard")

	stats, err := uc.repository.GetDashboardStats(ctx, businessTypeID, businessID)
	if err != nil {
		uc.log.Error().Err(err).Msg("Error al obtener estadísticas del dashboard")
		return nil, err
	}

	uc.log.Info().
		Int64("users_total", stats.Users.Total).
		Int64("roles_total", stats.Roles.Total).
		Int64("permissions_total", stats.Permissions.Total).
		Int64("resources_total", stats.Resources.Total).
		Int64("businesses_total", stats.Businesses.Total).
		Msg("Estadísticas del dashboard obtenidas exitosamente")

	return stats, nil
}


