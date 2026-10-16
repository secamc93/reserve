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
	Search           string // Coincidencia parcial por nombre o ubicación
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
	StatusCodes         []string // Códigos de estado (pending, approved...)
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
	ID                   uint
	Name                 string
	TypeName             string
	TypeCode             string
	Description          string
	Location             string
	MaxCapacity          int
	AreaSqm              *float64
	HasEquipment         bool
	EquipmentDescription string
	HourlyRate           *float64
	RequiresDeposit      bool
	DepositAmount        *float64
	AllowsRecurring      bool
	IsActive             bool
	RequiresApproval     bool
	Schedules            []CommonAreaSchedule // Horario semanal activo
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
	CommonAreaID       uint
	CommonAreaName     string
	PropertyUnitID     uint
	PropertyUnitNumber string
	PropertyUnitBlock  string
	ResidentName       string
	StatusCode         string
	StatusName         string
	ReservationDate    time.Time
	StartTime          string
	EndTime            string
	NumberOfGuests     int
	Purpose            string
	RequiresApproval   bool
	TotalAmount        *float64
	DepositAmount      *float64
	DepositPaid        bool
	FullPaymentPaid    bool
	CheckedInAt        *time.Time
	CreatedAt          time.Time
}

// UpdateCommonAreaDTO - DTO para editar una zona común
type UpdateCommonAreaDTO struct {
	ID                   uint
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
	IsActive             bool
	ImageURLs            string
}

// ScheduleInputDTO - Horario de un día de la semana (0=domingo … 6=sábado)
type ScheduleInputDTO struct {
	DayOfWeek int
	StartTime string // HH:MM
	EndTime   string // HH:MM
	IsActive  bool
}

// CreateRestrictionDTO - DTO para bloquear una zona (mantenimiento, evento…)
type CreateRestrictionDTO struct {
	CommonAreaID    uint
	RestrictionType string
	StartDate       time.Time
	EndDate         time.Time
	StartTime       *string
	EndTime         *string
	Reason          string
	CreatedByUserID uint
}

// UpdatePaymentsDTO - Marcas de pago de una reserva (nil = sin cambio)
type UpdatePaymentsDTO struct {
	DepositPaid     *bool
	FullPaymentPaid *bool
}

// UnitLookupDTO - Unidad para el buscador de reservas ("Casa 126")
type UnitLookupDTO struct {
	ID     uint
	Number string
	Block  string
}
