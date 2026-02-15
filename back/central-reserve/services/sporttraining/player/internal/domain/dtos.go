package domain

import "time"

// CreatePlayerDTO - DTO para crear jugador
type CreatePlayerDTO struct {
	BusinessID          uint
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
}

// UpdatePlayerDTO - DTO para actualizar jugador
type UpdatePlayerDTO struct {
	ID                  uint
	BusinessID          uint
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
}

// PlayerFiltersDTO - Filtros para listar jugadores
type PlayerFiltersDTO struct {
	BusinessID   uint
	IsMinor      *bool
	SkillLevelID *uint
	Name         string
	IsActive     *bool
	Page         int
	PageSize     int
}

// PaginatedPlayersDTO - Resultado paginado de jugadores
type PaginatedPlayersDTO struct {
	Players    []PlayerListDTO
	Total      int64
	Page       int
	PageSize   int
	TotalPages int
}

// PlayerListDTO - DTO para lista de jugadores
type PlayerListDTO struct {
	ID                uint
	FirstName         string
	LastName          string
	DocumentNumber    string
	DateOfBirth       time.Time
	Gender            string
	Email             *string
	Phone             *string
	PreferredPosition string
	SkillLevelName    string
	IsMinor           bool
	IsActive          bool
	CreatedAt         time.Time
}
