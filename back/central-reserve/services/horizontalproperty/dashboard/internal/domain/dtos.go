package domain

import "time"

// DashboardSummaryDTO es el DTO para el resumen del dashboard
type DashboardSummaryDTO struct {
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

// VotingStatisticsDTO es el DTO para estadísticas de votaciones
type VotingStatisticsDTO struct {
	TotalVotings       int64 `json:"total_votings"`
	ActiveVotings      int64 `json:"active_votings"`
	CompletedVotings   int64 `json:"completed_votings"`
	PendingVotings     int64 `json:"pending_votings"`
	TotalVotes         int64 `json:"total_votes"`
	TotalVotingGroups  int64 `json:"total_voting_groups"`
	ActiveVotingGroups int64 `json:"active_voting_groups"`
}

// AttendanceStatisticsDTO es el DTO para estadísticas de asistencia
type AttendanceStatisticsDTO struct {
	TotalLists      int64 `json:"total_lists"`
	ActiveLists     int64 `json:"active_lists"`
	TotalRecords    int64 `json:"total_records"`
	AttendedRecords int64 `json:"attended_records"`
	PendingRecords  int64 `json:"pending_records"`
	TotalProxies    int64 `json:"total_proxies"`
}

// BusinessSummaryDTO es el DTO para resumen por business (super admin)
type BusinessSummaryDTO struct {
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

// DashboardResponseDTO es la respuesta completa del dashboard
type DashboardResponseDTO struct {
	Summary           DashboardSummaryDTO          `json:"summary"`
	VotingStats       VotingStatisticsDTO          `json:"voting_stats"`
	AttendanceStats   AttendanceStatisticsDTO      `json:"attendance_stats"`
	BusinessSummaries []BusinessSummaryDTO         `json:"business_summaries,omitempty"` // Solo para super admin
	Pagination        *BusinessSummariesPagination `json:"pagination,omitempty"`         // Solo para super admin con paginación
}

// BusinessSummariesPagination contiene información de paginación para business summaries
type BusinessSummariesPagination struct {
	Page       int   `json:"page"`
	PageSize   int   `json:"page_size"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}

