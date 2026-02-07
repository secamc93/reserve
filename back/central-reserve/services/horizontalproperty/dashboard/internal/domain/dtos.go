package domain

import "time"

// DashboardSummaryDTO es el DTO para el resumen del dashboard
type DashboardSummaryDTO struct {
	BusinessID                uint
	BusinessName              string
	TotalHorizontalProperties int64
	TotalUnits                int64
	TotalResidents            int64
	TotalVotingGroups         int64
	ActiveVotings             int64
	CompletedVotings          int64
	TotalAttendanceLists      int64
	ActiveAttendanceLists     int64
	TotalVotes                int64
	TotalProxies              int64
}

// VotingStatisticsDTO es el DTO para estadísticas de votaciones
type VotingStatisticsDTO struct {
	TotalVotings       int64
	ActiveVotings      int64
	CompletedVotings   int64
	PendingVotings     int64
	TotalVotes         int64
	TotalVotingGroups  int64
	ActiveVotingGroups int64
}

// AttendanceStatisticsDTO es el DTO para estadísticas de asistencia
type AttendanceStatisticsDTO struct {
	TotalLists      int64
	ActiveLists     int64
	TotalRecords    int64
	AttendedRecords int64
	PendingRecords  int64
	TotalProxies    int64
}

// BusinessSummaryDTO es el DTO para resumen por business (super admin)
type BusinessSummaryDTO struct {
	BusinessID                uint
	BusinessName              string
	BusinessTypeID            uint
	LogoURL                   string
	TotalHorizontalProperties int64
	TotalUnits                int64
	TotalResidents            int64
	ActiveVotings             int64
	ActiveAttendanceLists     int64
	LastActivity              *time.Time
}

// DashboardResponseDTO es la respuesta completa del dashboard
type DashboardResponseDTO struct {
	Summary           DashboardSummaryDTO
	VotingStats       VotingStatisticsDTO
	AttendanceStats   AttendanceStatisticsDTO
	BusinessSummaries []BusinessSummaryDTO
	Pagination        *BusinessSummariesPagination
}

// BusinessSummariesPagination contiene información de paginación para business summaries
type BusinessSummariesPagination struct {
	Page       int
	PageSize   int
	Total      int64
	TotalPages int
}
