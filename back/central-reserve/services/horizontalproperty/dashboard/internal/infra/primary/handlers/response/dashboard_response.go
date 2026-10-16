package response

import (
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

// TodayResponse - Resumen de hoy de una propiedad
type TodayResponse struct {
	VisitsInside        []InsideVisitResponse      `json:"visits_inside"`
	VisitsInsideCount   int64                      `json:"visits_inside_count"`
	VisitsExceededCount int64                      `json:"visits_exceeded_count"`
	PackagesPending     int64                      `json:"packages_pending"`
	PackagesOld         int64                      `json:"packages_old"`
	ReservationsToday   []TodayReservationResponse `json:"reservations_today"`
	ReservationsPending int64                      `json:"reservations_pending"`
	ActiveVoting        *ActiveVotingResponse      `json:"active_voting"`
	Occupancy           OccupancyResponse          `json:"occupancy"`
}

type InsideVisitResponse struct {
	VisitorName string    `json:"visitor_name"`
	VisitType   string    `json:"visit_type"`
	UnitNumber  string    `json:"unit_number"`
	UnitBlock   string    `json:"unit_block"`
	EntryTime   time.Time `json:"entry_time"`
	Exceeded    bool      `json:"exceeded"`
}

type TodayReservationResponse struct {
	StartTime  string `json:"start_time"`
	EndTime    string `json:"end_time"`
	AreaName   string `json:"area_name"`
	UnitNumber string `json:"unit_number"`
	UnitBlock  string `json:"unit_block"`
	Approved   bool   `json:"approved"`
}

type ActiveVotingResponse struct {
	GroupID          uint     `json:"group_id"`
	GroupName        string   `json:"group_name"`
	VotingID         uint     `json:"voting_id"`
	Title            string   `json:"title"`
	VotedUnits       int64    `json:"voted_units"`
	TotalUnits       int64    `json:"total_units"`
	QuorumPercentage *float64 `json:"quorum_percentage"`
	AttendanceByCoef *float64 `json:"attendance_by_coef"`
}

type OccupancyResponse struct {
	Units              int64 `json:"units"`
	UnitsWithResident  int64 `json:"units_with_resident"`
	ParkingSlots       int64 `json:"parking_slots"`
	ParkingAssigned    int64 `json:"parking_assigned"`
	Residents          int64 `json:"residents"`
	ResidentsWithEmail int64 `json:"residents_with_email"`
}
