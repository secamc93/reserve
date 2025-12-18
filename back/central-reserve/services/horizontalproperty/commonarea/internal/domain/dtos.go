package domain

import "time"

// CreateCommonAreaDTO - DTO para crear zona común
type CreateCommonAreaDTO struct {
	BusinessID           uint
	CommonAreaTypeID     uint
	Name                 string
	Description          string
	Location             string
	MaxCapacity          int
	AreaSqm              *float64
	HasEquipment         bool
	EquipmentDescription string
	HourlyRate           *float64
	RequiresApproval     bool
	RequiresDeposit      bool
	DepositAmount        *float64
	AllowsRecurring      bool
	ImageURLs            string
}

// CreateReservationDTO - DTO para crear reserva
type CreateReservationDTO struct {
	BusinessID       uint
	CommonAreaID     uint
	PropertyUnitID   uint
	ResidentID       *uint
	ReservationDate  time.Time
	StartTime        string
	EndTime          string
	NumberOfGuests   int
	Purpose          string
	SpecialRequests  string
	IsRecurring      bool
	RecurringPattern *CreateRecurringPatternDTO
}

// CreateRecurringPatternDTO - DTO para crear patrón recurrente
type CreateRecurringPatternDTO struct {
	PatternType string
	DayOfWeek   *int
	DayOfMonth  *int
	StartDate   time.Time
	EndDate     *time.Time
	StartTime   string
	EndTime     string
	AutoApprove bool
}

// CheckAvailabilityDTO - DTO para verificar disponibilidad
type CheckAvailabilityDTO struct {
	CommonAreaID         uint
	ReservationDate      time.Time
	StartTime            string
	EndTime              string
	ExcludeReservationID *uint // Para excluir una reserva existente (en caso de edición)
}

// CommonAreaFiltersDTO - Filtros para listar zonas comunes
type CommonAreaFiltersDTO struct {
	BusinessID       uint
	CommonAreaTypeID *uint
	IsActive         *bool
	Page             int
	PageSize         int
}

// ReservationFiltersDTO - Filtros para listar reservas
type ReservationFiltersDTO struct {
	BusinessID          uint
	CommonAreaID        *uint
	PropertyUnitID      *uint
	ResidentID          *uint
	ReservationStatusID *uint
	StartDate           *time.Time
	EndDate             *time.Time
	Page                int
	PageSize            int
}

// PaginatedCommonAreasDTO - Resultado paginado de zonas comunes
type PaginatedCommonAreasDTO struct {
	CommonAreas []CommonAreaListDTO
	Total       int64
	Page        int
	PageSize    int
	TotalPages  int
}

// CommonAreaListDTO - DTO para lista de zonas comunes
type CommonAreaListDTO struct {
	ID               uint
	Name             string
	TypeName         string
	Location         string
	MaxCapacity      int
	IsActive         bool
	RequiresApproval bool
}

// PaginatedReservationsDTO - Resultado paginado de reservas
type PaginatedReservationsDTO struct {
	Reservations []ReservationListDTO
	Total        int64
	Page         int
	PageSize     int
	TotalPages   int
}

// ReservationListDTO - DTO para lista de reservas
type ReservationListDTO struct {
	ID                 uint
	CommonAreaName     string
	PropertyUnitNumber string
	ResidentName       string
	StatusName         string
	ReservationDate    time.Time
	StartTime          string
	EndTime            string
	NumberOfGuests     int
	CreatedAt          time.Time
}
