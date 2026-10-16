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



// TodaySummary - "Qué está pasando hoy" en una propiedad (Resumen de la propiedad).
type TodaySummary struct {
	VisitsInside        []InsideVisit
	VisitsInsideCount   int64
	VisitsExceededCount int64 // visitas dentro que ya pasaron su hora de salida
	PackagesPending     int64 // paquetes en portería sin entregar
	PackagesOld         int64 // de esos, recibidos hace más de 5 días
	ReservationsToday   []TodayReservation
	ReservationsPending int64 // reservas de hoy pendientes de aprobar
	ActiveVoting        *ActiveVotingSummary
	Occupancy           OccupancySummary
}

type InsideVisit struct {
	VisitorName string
	VisitType   string
	UnitNumber  string
	UnitBlock   string
	EntryTime   time.Time
	Exceeded    bool
}

type TodayReservation struct {
	StartTime  string
	EndTime    string
	AreaName   string
	UnitNumber string
	UnitBlock  string
	Approved   bool
}

type ActiveVotingSummary struct {
	GroupID    uint
	GroupName  string
	VotingID   uint
	Title      string
	VotedUnits int64
	TotalUnits int64
	// QuorumPercentage del grupo (nil si no requiere).
	QuorumPercentage *float64
	// AttendanceByCoef: % de coeficiente presente en la lista de asistencia del grupo (nil si no hay lista).
	AttendanceByCoef *float64
}

type OccupancySummary struct {
	Units              int64
	UnitsWithResident  int64
	ParkingSlots       int64
	ParkingAssigned    int64
	Residents          int64
	ResidentsWithEmail int64
}
