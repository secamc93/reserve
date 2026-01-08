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
	Page           int
	PageSize       int
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
	PropertyUnitNumber string
	VisitTypeName      string
	VisitStatusName    string
	ScheduledDate      time.Time
	ActualEntryTime    *time.Time
	ActualExitTime     *time.Time
	CreatedAt          time.Time
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
