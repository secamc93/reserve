package domain

import "time"

// Player - Entidad de jugador
type Player struct {
	ID                  uint
	BusinessID          uint
	UserID              *uint
	FirstName           string
	LastName            string
	DocumentType        string
	DocumentNumber      string
	DateOfBirth         time.Time
	Gender              string
	Email               *string
	Phone               *string
	Address             string
	City                string
	State               string
	Country             string
	SkillLevelID        *uint
	PreferredPosition   string
	Height              *float64
	Weight              *float64
	JerseyNumber        *int
	BloodType           string
	HasAllergies        bool
	AllergyDetails      string
	HasMedicalCondition bool
	MedicalDetails      string
	EmergencyContact    string
	EmergencyPhone      string
	PhotoURL            string
	Notes               string
	IsActive            bool
	IsMinor             bool
	CreatedAt           time.Time
	UpdatedAt           time.Time

	// Relaciones
	SkillLevel *SkillLevel
}

// SkillLevel - Nivel de habilidad (referencia)
type SkillLevel struct {
	ID    uint
	Name  string
	Code  string
	Level int
	Color string
}
