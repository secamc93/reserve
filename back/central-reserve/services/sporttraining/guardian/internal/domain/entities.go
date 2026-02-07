package domain

import "time"

// Guardian - Entidad de tutor
type Guardian struct {
	ID               uint
	BusinessID       uint
	UserID           *uint
	FirstName        string
	LastName         string
	DocumentType     string
	DocumentNumber   string
	Email            string
	Phone            string
	SecondaryPhone   *string
	Address          string
	City             string
	State            string
	Country          string
	Relationship     string
	PhotoURL         string
	Notes            string
	CanBookSessions  bool
	CanAccessRecords bool
	IsActive         bool
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

// PlayerGuardianAssignment - Asignación de tutor a jugador
type PlayerGuardianAssignment struct {
	PlayerID           uint
	GuardianID         uint
	RelationshipType   string
	IsPrimaryGuardian  bool
	CanPickup          bool
	CanBookSessions    bool
	HasMedicalAuthority bool
	StartDate          time.Time
}
