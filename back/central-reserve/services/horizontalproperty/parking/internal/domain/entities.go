package domain

import "time"

// ParkingType - Tipo de parqueadero (maestro)
type ParkingType struct {
	ID          uint
	Name        string
	Code        string
	Description string
	IsActive    bool
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// ParkingZone - Zona de parqueo
type ParkingZone struct {
	ID          uint
	BusinessID  uint
	Name        string
	Code        string
	Description string
	Location    string
	TotalSlots  int
	IsActive    bool
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// ParkingSlot - Espacio individual de parqueo
type ParkingSlot struct {
	ID            uint
	ParkingZoneID uint
	ParkingTypeID uint
	SlotNumber    string
	IsCovered     bool
	Width         *float64
	Length        *float64
	Height        *float64
	HasCharger    bool
	IsActive      bool
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

// ParkingAssignment - Asignación permanente de parqueadero
type ParkingAssignment struct {
	ID               uint
	BusinessID       uint
	ParkingSlotID    uint
	PropertyUnitID   *uint
	ResidentID       *uint
	VehiclePlate     string
	VehicleBrand     string
	VehicleModel     string
	VehicleColor     string
	StartDate        time.Time
	EndDate          *time.Time
	IsActive         bool
	Notes            string
	AssignedByUserID *uint
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

// ParkingReservationStatus - Estado de reserva (maestro)
type ParkingReservationStatus struct {
	ID          uint
	Code        string
	Name        string
	Description string
	IsFinal     bool
	IsActive    bool
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// ParkingReservation - Reserva temporal de parqueadero
type ParkingReservation struct {
	ID                  uint
	BusinessID          uint
	ParkingSlotID       uint
	PropertyUnitID      *uint
	ResidentID          *uint
	VisitorID           *uint
	VisitorVehicleID    *uint
	ReservationStatusID uint
	ReservationDate     time.Time
	StartTime           string
	EndTime             string
	DurationHours       float64
	VehiclePlate        string
	VehicleBrand        string
	VehicleModel        string
	VehicleColor        string
	QRCode              string
	AccessCode          string
	CheckedInAt         *time.Time
	CheckedOutAt        *time.Time
	CheckedInByUserID   *uint
	CheckedOutByUserID  *uint
	RequiresApproval    bool
	ApprovedByUserID    *uint
	ApprovedAt          *time.Time
	RejectedByUserID    *uint
	RejectedAt          *time.Time
	RejectionReason     string
	NotifyResident      bool
	NotifyAdmin         bool
	NotificationSentAt  *time.Time
	ReminderSentAt      *time.Time
	CancelledAt         *time.Time
	CancelledByUserID   *uint
	CancellationReason  string
	Notes               string
	ResidentNotes       string
	CreatedAt           time.Time
	UpdatedAt           time.Time
}

// ParkingOccupancy - Registro de ocupación en tiempo real
type ParkingOccupancy struct {
	ID                   uint
	ParkingSlotID        uint
	ParkingReservationID *uint
	VehiclePlate         string
	EntryTime            time.Time
	ExitTime             *time.Time
	IsActive             bool
	EntryMethod          string
	EntryGate            string
	ExitGate             string
	RegisteredByUserID   *uint
	Notes                string
	CreatedAt            time.Time
	UpdatedAt            time.Time
}
