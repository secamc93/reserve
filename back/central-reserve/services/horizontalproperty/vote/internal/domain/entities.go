package domain

import "time"

// VotingGroup - Grupo de votaciones (por ejemplo, Asamblea)
type VotingGroup struct {
	ID               uint
	BusinessID       uint
	Name             string
	Description      string
	VotingStartDate  time.Time
	VotingEndDate    time.Time
	IsActive         bool
	RequiresQuorum   bool
	QuorumPercentage *float64
	CreatedByUserID  *uint
	Notes            string

	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt *time.Time
}

// Voting - Votación individual dentro de un grupo
type Voting struct {
	ID                 uint
	VotingGroupID      uint
	Title              string
	Description        string
	VotingType         string
	IsSecret           bool
	AllowAbstention    bool
	IsActive           bool
	DisplayOrder       int
	RequiredPercentage *float64

	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt *time.Time
}

// VotingOption - Opción de una votación
type VotingOption struct {
	ID           uint
	VotingID     uint
	OptionText   string
	OptionCode   string
	Color        string
	DisplayOrder int
	IsActive     bool
}

// Vote - Voto emitido por una unidad residencial
type Vote struct {
	ID             uint
	VotingID       uint
	PropertyUnitID uint
	VotingOptionID uint
	OptionText     string // Texto de la opción votada (solo cuando se carga con Preload)
	OptionCode     string // Código de la opción votada (solo cuando se carga con Preload)
	OptionColor    string // Color de la opción votada (solo cuando se carga con Preload)
	VotedAt        time.Time
	IPAddress      string
	UserAgent      string
	Notes          string
}

// UnvotedUnit - Entidad para unidades que no han votado
type UnvotedUnit struct {
	UnitID       uint
	UnitNumber   string
	ResidentID   uint
	ResidentName string
}
