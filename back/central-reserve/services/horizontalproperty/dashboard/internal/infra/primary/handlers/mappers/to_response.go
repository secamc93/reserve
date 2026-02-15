package mappers

import (
	"central_reserve/services/horizontalproperty/dashboard/internal/domain"
	"central_reserve/services/horizontalproperty/dashboard/internal/infra/primary/handlers/response"
)

// MapDashboardToResponse mapea el DTO del dominio a la respuesta HTTP
func MapDashboardToResponse(dto *domain.DashboardResponseDTO) *response.DashboardResponse {
	resp := &response.DashboardResponse{
		Summary: response.DashboardSummaryResponse{
			BusinessID:                dto.Summary.BusinessID,
			BusinessName:              dto.Summary.BusinessName,
			TotalHorizontalProperties: dto.Summary.TotalHorizontalProperties,
			TotalUnits:                dto.Summary.TotalUnits,
			TotalResidents:            dto.Summary.TotalResidents,
			TotalVotingGroups:         dto.Summary.TotalVotingGroups,
			ActiveVotings:             dto.Summary.ActiveVotings,
			CompletedVotings:          dto.Summary.CompletedVotings,
			TotalAttendanceLists:      dto.Summary.TotalAttendanceLists,
			ActiveAttendanceLists:     dto.Summary.ActiveAttendanceLists,
			TotalVotes:                dto.Summary.TotalVotes,
			TotalProxies:              dto.Summary.TotalProxies,
		},
		VotingStats: response.VotingStatisticsResponse{
			TotalVotings:       dto.VotingStats.TotalVotings,
			ActiveVotings:      dto.VotingStats.ActiveVotings,
			CompletedVotings:   dto.VotingStats.CompletedVotings,
			PendingVotings:     dto.VotingStats.PendingVotings,
			TotalVotes:         dto.VotingStats.TotalVotes,
			TotalVotingGroups:  dto.VotingStats.TotalVotingGroups,
			ActiveVotingGroups: dto.VotingStats.ActiveVotingGroups,
		},
		AttendanceStats: response.AttendanceStatisticsResponse{
			TotalLists:      dto.AttendanceStats.TotalLists,
			ActiveLists:     dto.AttendanceStats.ActiveLists,
			TotalRecords:    dto.AttendanceStats.TotalRecords,
			AttendedRecords: dto.AttendanceStats.AttendedRecords,
			PendingRecords:  dto.AttendanceStats.PendingRecords,
			TotalProxies:    dto.AttendanceStats.TotalProxies,
		},
	}

	if len(dto.BusinessSummaries) > 0 {
		resp.BusinessSummaries = make([]response.BusinessSummaryResponse, len(dto.BusinessSummaries))
		for i, bs := range dto.BusinessSummaries {
			resp.BusinessSummaries[i] = response.BusinessSummaryResponse{
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

		// Mapear paginación si existe
		if dto.Pagination != nil {
			resp.Pagination = &response.BusinessSummariesPaginationResponse{
				Page:       dto.Pagination.Page,
				PageSize:   dto.Pagination.PageSize,
				Total:      dto.Pagination.Total,
				TotalPages: dto.Pagination.TotalPages,
			}
		}
	}

	return resp
}
