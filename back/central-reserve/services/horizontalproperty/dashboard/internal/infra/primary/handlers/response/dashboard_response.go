package response

import (
	"central_reserve/services/horizontalproperty/dashboard/internal/domain"
	"time"
)

// DashboardResponse es la respuesta del dashboard
type DashboardResponse struct {
	Summary           DashboardSummaryResponse             `json:"summary"`
	VotingStats       VotingStatisticsResponse             `json:"voting_stats"`
	AttendanceStats   AttendanceStatisticsResponse         `json:"attendance_stats"`
	BusinessSummaries []BusinessSummaryResponse            `json:"business_summaries,omitempty"`
	Pagination        *BusinessSummariesPaginationResponse `json:"pagination,omitempty"`
}

// BusinessSummariesPaginationResponse contiene información de paginación
type BusinessSummariesPaginationResponse struct {
	Page       int   `json:"page"`
	PageSize   int   `json:"page_size"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}

// DashboardSummaryResponse es el resumen del dashboard
type DashboardSummaryResponse struct {
	BusinessID                uint   `json:"business_id"`
	BusinessName              string `json:"business_name,omitempty"`
	TotalHorizontalProperties int64  `json:"total_horizontal_properties"`
	TotalUnits                int64  `json:"total_units"`
	TotalResidents            int64  `json:"total_residents"`
	TotalVotingGroups         int64  `json:"total_voting_groups"`
	ActiveVotings             int64  `json:"active_votings"`
	CompletedVotings          int64  `json:"completed_votings"`
	TotalAttendanceLists      int64  `json:"total_attendance_lists"`
	ActiveAttendanceLists     int64  `json:"active_attendance_lists"`
	TotalVotes                int64  `json:"total_votes"`
	TotalProxies              int64  `json:"total_proxies"`
}

// VotingStatisticsResponse son las estadísticas de votaciones
type VotingStatisticsResponse struct {
	TotalVotings       int64 `json:"total_votings"`
	ActiveVotings      int64 `json:"active_votings"`
	CompletedVotings   int64 `json:"completed_votings"`
	PendingVotings     int64 `json:"pending_votings"`
	TotalVotes         int64 `json:"total_votes"`
	TotalVotingGroups  int64 `json:"total_voting_groups"`
	ActiveVotingGroups int64 `json:"active_voting_groups"`
}

// AttendanceStatisticsResponse son las estadísticas de asistencia
type AttendanceStatisticsResponse struct {
	TotalLists      int64 `json:"total_lists"`
	ActiveLists     int64 `json:"active_lists"`
	TotalRecords    int64 `json:"total_records"`
	AttendedRecords int64 `json:"attended_records"`
	PendingRecords  int64 `json:"pending_records"`
	TotalProxies    int64 `json:"total_proxies"`
}

// BusinessSummaryResponse es el resumen por business (super admin)
type BusinessSummaryResponse struct {
	BusinessID                uint       `json:"business_id"`
	BusinessName              string     `json:"business_name"`
	BusinessTypeID            uint       `json:"business_type_id"`
	LogoURL                   string     `json:"logo_url,omitempty"`
	TotalHorizontalProperties int64      `json:"total_horizontal_properties"`
	TotalUnits                int64      `json:"total_units"`
	TotalResidents            int64      `json:"total_residents"`
	ActiveVotings             int64      `json:"active_votings"`
	ActiveAttendanceLists     int64      `json:"active_attendance_lists"`
	LastActivity              *time.Time `json:"last_activity,omitempty"`
}

// SuccessResponse es la respuesta exitosa genérica
type SuccessResponse[T any] struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    T      `json:"data"`
}

// ErrorResponse es la respuesta de error
type ErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
	Error   string `json:"error"`
}

// MapDashboardToResponse mapea el DTO del dominio a la respuesta HTTP
func MapDashboardToResponse(dto *domain.DashboardResponseDTO) *DashboardResponse {
	response := &DashboardResponse{
		Summary: DashboardSummaryResponse{
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
		VotingStats: VotingStatisticsResponse{
			TotalVotings:       dto.VotingStats.TotalVotings,
			ActiveVotings:      dto.VotingStats.ActiveVotings,
			CompletedVotings:   dto.VotingStats.CompletedVotings,
			PendingVotings:     dto.VotingStats.PendingVotings,
			TotalVotes:         dto.VotingStats.TotalVotes,
			TotalVotingGroups:  dto.VotingStats.TotalVotingGroups,
			ActiveVotingGroups: dto.VotingStats.ActiveVotingGroups,
		},
		AttendanceStats: AttendanceStatisticsResponse{
			TotalLists:      dto.AttendanceStats.TotalLists,
			ActiveLists:     dto.AttendanceStats.ActiveLists,
			TotalRecords:    dto.AttendanceStats.TotalRecords,
			AttendedRecords: dto.AttendanceStats.AttendedRecords,
			PendingRecords:  dto.AttendanceStats.PendingRecords,
			TotalProxies:    dto.AttendanceStats.TotalProxies,
		},
	}

	if len(dto.BusinessSummaries) > 0 {
		response.BusinessSummaries = make([]BusinessSummaryResponse, len(dto.BusinessSummaries))
		for i, bs := range dto.BusinessSummaries {
			response.BusinessSummaries[i] = BusinessSummaryResponse{
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
			response.Pagination = &BusinessSummariesPaginationResponse{
				Page:       dto.Pagination.Page,
				PageSize:   dto.Pagination.PageSize,
				Total:      dto.Pagination.Total,
				TotalPages: dto.Pagination.TotalPages,
			}
		}
	}

	return response
}


