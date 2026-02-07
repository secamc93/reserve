package domain

import "time"

// CreateGuardianDTO - DTO para crear tutor
type CreateGuardianDTO struct {
	BusinessID       uint
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
}

// UpdateGuardianDTO - DTO para actualizar tutor
type UpdateGuardianDTO struct {
	ID               uint
	BusinessID       uint
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
}

// GuardianFiltersDTO - Filtros para listar tutores
type GuardianFiltersDTO struct {
	BusinessID uint
	Name       string
	IsActive   *bool
	Page       int
	PageSize   int
}

// PaginatedGuardiansDTO - Resultado paginado de tutores
type PaginatedGuardiansDTO struct {
	Guardians  []GuardianListDTO
	Total      int64
	Page       int
	PageSize   int
	TotalPages int
}

// GuardianListDTO - DTO para lista de tutores
type GuardianListDTO struct {
	ID             uint
	FirstName      string
	LastName       string
	DocumentNumber string
	Email          string
	Phone          string
	Relationship   string
	IsActive       bool
	CreatedAt      time.Time
}

// AssignGuardianDTO - DTO para asignar tutor a jugador
type AssignGuardianDTO struct {
	PlayerID            uint
	GuardianID          uint
	RelationshipType    string
	IsPrimaryGuardian   bool
	CanPickup           bool
	CanBookSessions     bool
	HasMedicalAuthority bool
}

// PlayerGuardianDTO - DTO para tutor de jugador
type PlayerGuardianDTO struct {
	ID                  uint
	FirstName           string
	LastName            string
	DocumentNumber      string
	Email               string
	Phone               string
	RelationshipType    string
	IsPrimaryGuardian   bool
	CanPickup           bool
	CanBookSessions     bool
	HasMedicalAuthority bool
	StartDate           time.Time
}
