package domain

import "time"

// Visitor - Entidad de visitante (maestro)
type Visitor struct {
	ID           uint
	BusinessID   *uint
	DNI          string
	FullName     string
	Phone        string
	Email        string
	PhotoURL     string
	HasBlacklist bool
	IsVerified   bool
	LastVisitAt  *time.Time
	TotalVisits  int
	Notes        string
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

// VisitType - Tipo de visita
type VisitType struct {
	ID                          uint
	Name                        string
	Code                        string
	Description                 string
	RequiresAuthorization       bool
	RequiresVehicleRegistration bool
	RequiresCompanions          bool
	RequiresAssetsTracking      bool
	MaxDurationHours            *int
	DefaultDurationMinutes      *int
	IsActive                    bool
}

// VisitStatus - Estado de visita
type VisitStatus struct {
	ID          uint
	Code        string
	Name        string
	Description string
	IsFinal     bool
	IsActive    bool
}

// VisitorVehicle - Vehículo de visitante
type VisitorVehicle struct {
	ID            uint
	BusinessID    uint
	VisitorID     *uint
	Plate         string
	Brand         string
	VehicleModel  string
	Color         string
	Year          *int
	ParkingSlotID *uint
	ParkingNumber string
	ParkingZone   string
	IsOccupied    bool
	IsActive      bool
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

// Visit - Entidad de visita
type Visit struct {
	ID                      uint
	BusinessID              uint
	VisitorID               uint
	PropertyUnitID          uint
	ResidentID              *uint
	VisitTypeID             uint
	VisitStatusID           uint
	VisitorVehicleID        *uint
	ScheduledDate           time.Time
	ScheduledStartTime      time.Time
	ScheduledEndTime        *time.Time
	ActualEntryTime         *time.Time
	ActualExitTime          *time.Time
	DurationMinutes         *int
	AuthorizationCode       string
	QRCode                  string
	QRCodeExpiresAt         *time.Time
	AuthorizedByResidentID  *uint
	AuthorizationDate       *time.Time
	AuthorizationExpiresAt  *time.Time
	RegisteredByUserID      *uint
	EntryRegisteredByUserID *uint
	ExitRegisteredByUserID  *uint
	EntryGate               string
	ExitGate                string
	EntryMethod             string
	Purpose                 string
	NumberOfVisitors        int
	HasCompanions           bool
	HasAssets               bool
	Notes                   string
	IsRecurring             bool
	RecurringPatternID      *uint
	ParentVisitID           *uint
	DurationExceeded        bool
	DurationExceededAt      *time.Time
	AlertSent               bool
	NotifyResident          bool
	NotifySecurity          bool
	NotificationSentAt      *time.Time
	CreatedAt               time.Time
	UpdatedAt               time.Time
}

// VisitCompanion - Acompañante de visita
type VisitCompanion struct {
	ID             uint
	VisitID        uint
	VisitorID      *uint
	CompanionName  string
	CompanionDNI   string
	CompanionPhone string
	IsMinor        bool
	Relationship   string
	Notes          string
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

// VisitAsset - Equipo/herramienta de visita
type VisitAsset struct {
	ID                    uint
	VisitID               uint
	AssetName             string
	AssetDescription      string
	AssetSerial           string
	AssetBrand            string
	EntryRegistered       bool
	EntryRegisteredAt     *time.Time
	ExitRegistered        bool
	ExitRegisteredAt      *time.Time
	EntryVerifiedByUserID *uint
	ExitVerifiedByUserID  *uint
	Notes                 string
	CreatedAt             time.Time
	UpdatedAt             time.Time
}

// VisitBlacklist - Lista negra de visitantes
type VisitBlacklist struct {
	ID                uint
	BusinessID        uint
	VisitorID         uint
	Reason            string
	BlockedByUserID   uint
	BlockedAt         time.Time
	UnblockedAt       *time.Time
	UnblockedByUserID *uint
	UnblockReason     string
	IsActive          bool
	Notes             string
	CreatedAt         time.Time
	UpdatedAt         time.Time
}
