package domain

import "time"

// CreateVisitDTO - DTO para crear visita
type CreateVisitDTO struct {
	BusinessID         uint
	VisitorID          uint
	PropertyUnitID     uint
	ResidentID         *uint
	VisitTypeID        uint
	VisitorVehicleID   *uint
	ScheduledDate      time.Time
	ScheduledStartTime time.Time
	ScheduledEndTime   *time.Time
	Purpose            string
	NumberOfVisitors   int
	HasCompanions      bool
	HasAssets          bool
	Notes              string
	NotifyResident     bool
	NotifySecurity     bool
}

// VisitFiltersDTO - Filtros para listar visitas
type VisitFiltersDTO struct {
	BusinessID     uint
	VisitorID      *uint
	PropertyUnitID *uint
	ResidentID     *uint
	VisitTypeID    *uint
	VisitStatusID  *uint
	StartDate      *time.Time
	EndDate        *time.Time
	// State agrupa estados: inside, expected, left, cancelled (ver VisitStateGroups). Vacío = todos.
	State string
	// Search busca por nombre o documento del visitante o por la unidad ("Casa 126").
	Search   string
	Page     int
	PageSize int
}

// PaginatedVisitsDTO - Resultado paginado de visitas
type PaginatedVisitsDTO struct {
	Visits     []VisitListDTO
	Total      int64
	Page       int
	PageSize   int
	TotalPages int
}

// VisitListDTO - DTO para lista de visitas
type VisitListDTO struct {
	ID                 uint
	VisitorName        string
	VisitorDNI         string
	VisitorPhone       string
	PropertyUnitNumber string
	PropertyUnitBlock  string
	VisitTypeName      string
	VisitStatusName    string
	VisitStatusCode    string
	ScheduledDate      time.Time
	ScheduledStartTime time.Time
	ScheduledEndTime   *time.Time
	ActualEntryTime    *time.Time
	ActualExitTime     *time.Time
	Purpose            string
	NumberOfVisitors   int
	CreatedAt          time.Time
}

// VisitsSummaryDTO - Conteos de visitas de un día por estado (chips de la lista)
type VisitsSummaryDTO struct {
	Inside    int64 // en curso (entraron y no han salido)
	Expected  int64 // pendientes o autorizadas, sin entrada
	Left      int64 // completadas
	Cancelled int64 // canceladas, rechazadas o vencidas
	Total     int64
	// InsideNow: visitantes dentro ahora, sin importar el día programado.
	InsideNow int64
}

// CreateVisitAssetDTO - DTO para crear activo de visita
type CreateVisitAssetDTO struct {
	AssetName        string
	AssetDescription string
	AssetSerial      string
	AssetBrand       string
}

// UpdateVisitDTO - DTO para actualizar visita
type UpdateVisitDTO struct {
	PropertyUnitID     *uint
	ResidentID         *uint
	VisitTypeID        *uint
	ScheduledDate      *time.Time
	ScheduledStartTime *time.Time
	ScheduledEndTime   *time.Time
	Purpose            *string
	NumberOfVisitors   *int
	Notes              *string
	NotifyResident     *bool
	NotifySecurity     *bool
}

// CreateVisitCompanionDTO - DTO para crear acompañante
type CreateVisitCompanionDTO struct {
	CompanionName  string
	CompanionDNI   string
	CompanionPhone string
	IsMinor        bool
	Relationship   string
	Notes          string
}
