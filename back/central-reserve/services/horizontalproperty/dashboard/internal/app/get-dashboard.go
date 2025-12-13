package app

import (
	"context"
	"math"

	"central_reserve/services/horizontalproperty/dashboard/internal/domain"
	"central_reserve/shared/log"
)

// GetDashboard obtiene el dashboard completo según el tipo de usuario
func (uc *DashboardUseCase) GetDashboard(ctx context.Context, businessID uint, isSuperAdmin bool, page, pageSize int) (*domain.DashboardResponseDTO, error) {
	ctx = log.WithFunctionCtx(ctx, "GetDashboard")
	ctx = log.WithBusinessIDCtx(ctx, businessID)

	// Obtener resumen principal
	summary, err := uc.repo.GetDashboardSummary(ctx, businessID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error obteniendo resumen del dashboard")
		return nil, err
	}

	// Obtener estadísticas de votaciones
	votingStats, err := uc.repo.GetVotingStatistics(ctx, businessID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error obteniendo estadísticas de votaciones")
		return nil, err
	}

	// Obtener estadísticas de asistencia
	attendanceStats, err := uc.repo.GetAttendanceStatistics(ctx, businessID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error obteniendo estadísticas de asistencia")
		return nil, err
	}

	// Mapear a DTOs
	response := &domain.DashboardResponseDTO{
		Summary: domain.DashboardSummaryDTO{
			BusinessID:                summary.BusinessID,
			BusinessName:              summary.BusinessName,
			TotalHorizontalProperties: summary.TotalHorizontalProperties,
			TotalUnits:                summary.TotalUnits,
			TotalResidents:            summary.TotalResidents,
			TotalVotingGroups:         summary.TotalVotingGroups,
			ActiveVotings:             summary.ActiveVotings,
			CompletedVotings:          summary.CompletedVotings,
			TotalAttendanceLists:      summary.TotalAttendanceLists,
			ActiveAttendanceLists:     summary.ActiveAttendanceLists,
			TotalVotes:                summary.TotalVotes,
			TotalProxies:              summary.TotalProxies,
		},
		VotingStats: domain.VotingStatisticsDTO{
			TotalVotings:       votingStats.TotalVotings,
			ActiveVotings:      votingStats.ActiveVotings,
			CompletedVotings:   votingStats.CompletedVotings,
			PendingVotings:     votingStats.PendingVotings,
			TotalVotes:         votingStats.TotalVotes,
			TotalVotingGroups:  votingStats.TotalVotingGroups,
			ActiveVotingGroups: votingStats.ActiveVotingGroups,
		},
		AttendanceStats: domain.AttendanceStatisticsDTO{
			TotalLists:      attendanceStats.TotalLists,
			ActiveLists:     attendanceStats.ActiveLists,
			TotalRecords:    attendanceStats.TotalRecords,
			AttendedRecords: attendanceStats.AttendedRecords,
			PendingRecords:  attendanceStats.PendingRecords,
			TotalProxies:    attendanceStats.TotalProxies,
		},
	}

	// Si es super admin, obtener resúmenes de todos los businesses con paginación
	if isSuperAdmin && businessID == 0 {
		// Validar parámetros de paginación
		if page < 1 {
			page = 1
		}
		if pageSize < 1 {
			pageSize = 10
		}
		if pageSize > 100 {
			pageSize = 100
		}

		businessSummaries, total, err := uc.repo.GetBusinessSummaries(ctx, page, pageSize)
		if err != nil {
			uc.logger.Warn(ctx).Err(err).Msg("Error obteniendo resúmenes de businesses, continuando sin ellos")
		} else {
			response.BusinessSummaries = make([]domain.BusinessSummaryDTO, len(businessSummaries))
			for i, bs := range businessSummaries {
				response.BusinessSummaries[i] = domain.BusinessSummaryDTO{
					BusinessID:                bs.BusinessID,
					BusinessName:              bs.BusinessName,
					BusinessTypeID:            bs.BusinessTypeID,
					LogoURL:                   bs.LogoURL,
					TotalHorizontalProperties: bs.TotalHorizontalProperties,
					TotalUnits:                bs.TotalUnits,
					TotalResidents:            bs.TotalResidents,
					ActiveVotings:             bs.ActiveVotings,
					ActiveAttendanceLists:     bs.ActiveAttendanceLists,
					LastActivity:              bs.LastActivity,
				}
			}

			// Agregar información de paginación
			totalPages := int(math.Ceil(float64(total) / float64(pageSize)))
			response.Pagination = &domain.BusinessSummariesPagination{
				Page:       page,
				PageSize:   pageSize,
				Total:      total,
				TotalPages: totalPages,
			}
		}
	}

	return response, nil
}

// GetDashboardByBusiness obtiene el dashboard de un business específico (solo super admin)
func (uc *DashboardUseCase) GetDashboardByBusiness(ctx context.Context, businessID uint) (*domain.DashboardResponseDTO, error) {
	ctx = log.WithFunctionCtx(ctx, "GetDashboardByBusiness")
	ctx = log.WithBusinessIDCtx(ctx, businessID)

	return uc.GetDashboard(ctx, businessID, false, 1, 10)
}

