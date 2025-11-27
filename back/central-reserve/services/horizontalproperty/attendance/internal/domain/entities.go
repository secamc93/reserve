package domain

import "time"

// AttendanceList - Lista de asistencia para grupos de votación
type AttendanceList struct {
	ID              uint
	VotingGroupID   uint
	Title           string
	Description     string
	IsActive        bool
	CreatedByUserID *uint
	Notes           string
	CreatedAt       time.Time
	UpdatedAt       time.Time
	DeletedAt       *time.Time
}

// Proxy - Apoderado para representar unidades en votaciones
type Proxy struct {
	ID              uint
	BusinessID      uint
	PropertyUnitID  uint
	ProxyName       string
	ProxyDni        string
	ProxyEmail      string
	ProxyPhone      string
	ProxyAddress    string
	ProxyType       string // external, resident, family
	IsActive        bool
	StartDate       time.Time
	EndDate         *time.Time
	PowerOfAttorney string
	Notes           string
	CreatedAt       time.Time
	UpdatedAt       time.Time
	DeletedAt       *time.Time
}

// AttendanceRecord - Registro de asistencia por unidad
type AttendanceRecord struct {
	ID                uint
	AttendanceListID  uint
	PropertyUnitID    uint
	ResidentID        *uint
	ProxyID           *uint
	AttendedAsOwner   bool
	AttendedAsProxy   bool
	Signature         string
	SignatureDate     *time.Time
	SignatureMethod   string // digital, handwritten, electronic
	VerifiedBy        *uint
	VerificationDate  *time.Time
	VerificationNotes string
	Notes             string
	IsValid           bool
	CreatedAt         time.Time
	UpdatedAt         time.Time
	DeletedAt         *time.Time

	// Enriquecimiento para respuestas
	ResidentName             string
	ProxyName                string
	UnitNumber               string
	ParticipationCoefficient string
}
