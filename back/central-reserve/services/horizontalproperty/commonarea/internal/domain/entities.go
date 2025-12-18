package domain

import "time"

// CommonAreaType - Tipo de zona común (maestro)
type CommonAreaType struct {
	ID                 uint
	Name               string
	Code               string
	Description        string
	Icon               string
	DefaultMaxCapacity *int
	RequiresApproval   bool
	AllowsRecurring    bool
	IsActive           bool
}

// CommonArea - Zona común por propiedad
type CommonArea struct {
	ID                   uint
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
	IsActive             bool
	ImageURLs            string
	CreatedAt            time.Time
	UpdatedAt            time.Time
}

// CommonAreaSchedule - Horario de disponibilidad
type CommonAreaSchedule struct {
	ID           uint
	CommonAreaID uint
	DayOfWeek    int    // 0-6
	StartTime    string // HH:MM
	EndTime      string // HH:MM
	IsActive     bool
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

// CommonAreaRestriction - Restricción temporal
type CommonAreaRestriction struct {
	ID              uint
	CommonAreaID    uint
	RestrictionType string // maintenance, event, blocked, holiday
	StartDate       time.Time
	EndDate         time.Time
	StartTime       *string
	EndTime         *string
	Reason          string
	CreatedByUserID uint
	IsActive        bool
	CreatedAt       time.Time
	UpdatedAt       time.Time
}

// CommonAreaReservation - Reserva de zona común
type CommonAreaReservation struct {
	ID                  uint
	BusinessID          uint
	CommonAreaID        uint
	PropertyUnitID      uint
	ResidentID          *uint
	ReservationStatusID uint
	ReservationDate     time.Time
	StartTime           string
	EndTime             string
	DurationHours       float64
	RequiresApproval    bool
	ApprovedByUserID    *uint
	ApprovedAt          *time.Time
	RejectedByUserID    *uint
	RejectedAt          *time.Time
	RejectionReason     string
	NumberOfGuests      int
	Purpose             string
	SpecialRequests     string
	IsRecurring         bool
	RecurringPatternID  *uint
	ParentReservationID *uint
	TotalAmount         *float64
	DepositAmount       *float64
	DepositPaid         bool
	DepositPaidAt       *time.Time
	FullPaymentPaid     bool
	FullPaymentPaidAt   *time.Time
	QRCode              string
	AccessCode          string
	CheckedInAt         *time.Time
	CheckedOutAt        *time.Time
	CheckedInByUserID   *uint
	CheckedOutByUserID  *uint
	NotifyResident      bool
	NotifyAdmin         bool
	NotificationSentAt  *time.Time
	ReminderSentAt      *time.Time
	CancelledAt         *time.Time
	CancelledByUserID   *uint
	CancellationReason  string
	RefundAmount        *float64
	Notes               string
	ResidentNotes       string
	CreatedAt           time.Time
	UpdatedAt           time.Time
}

// CommonAreaReservationStatus - Estado de reserva
type CommonAreaReservationStatus struct {
	ID          uint
	Code        string
	Name        string
	Description string
	IsFinal     bool
	IsActive    bool
}

// RecurringReservationPattern - Patrón de reserva recurrente
type RecurringReservationPattern struct {
	ID             uint
	BusinessID     uint
	CommonAreaID   uint
	PropertyUnitID uint
	ResidentID     *uint
	PatternType    string // daily, weekly, monthly, custom
	DayOfWeek      *int
	DayOfMonth     *int
	StartDate      time.Time
	EndDate        *time.Time
	StartTime      string
	EndTime        string
	IsActive       bool
	AutoApprove    bool
	CreatedAt      time.Time
	UpdatedAt      time.Time
}
