package domain

import "time"

// DashboardSummary representa el resumen general del dashboard
type DashboardSummary struct {
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

// VotingStatistics representa estadísticas de votaciones
type VotingStatistics struct {
	TotalVotings       int64
	ActiveVotings      int64
	CompletedVotings   int64
	PendingVotings     int64
	TotalVotes         int64
	TotalVotingGroups  int64
	ActiveVotingGroups int64
}

// AttendanceStatistics representa estadísticas de asistencia
type AttendanceStatistics struct {
	TotalLists      int64
	ActiveLists     int64
	TotalRecords    int64
	AttendedRecords int64
	PendingRecords  int64
	TotalProxies    int64
}

// BusinessSummary representa un resumen por business (para super admin)
type BusinessSummary struct {
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
