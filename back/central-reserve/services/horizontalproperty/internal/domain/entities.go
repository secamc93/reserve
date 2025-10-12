package domain

import "time"

// ═══════════════════════════════════════════════════════════════════
//
//	HORIZONTAL PROPERTY ENTITIES
//
// ═══════════════════════════════════════════════════════════════════

// HorizontalProperty - Entidad de propiedad horizontal
type HorizontalProperty struct {
	ID               uint
	Name             string
	Code             string
	BusinessTypeID   uint
	ParentBusinessID *uint
	Timezone         string
	Address          string
	Description      string

	// Configuración de marca blanca
	LogoURL         string
	PrimaryColor    string
	SecondaryColor  string
	TertiaryColor   string
	QuaternaryColor string
	NavbarImageURL  string
	CustomDomain    string

	// Configuración de funcionalidades (heredada de Business)
	EnableDelivery     bool
	EnablePickup       bool
	EnableReservations bool

	// Configuración específica para propiedades horizontales
	TotalUnits    int
	TotalFloors   *int
	HasElevator   bool
	HasParking    bool
	HasPool       bool
	HasGym        bool
	HasSocialArea bool

	// Relaciones (solo se cargan cuando se solicita detalle)
	PropertyUnits []PropertyUnit
	Committees    []Committee

	IsActive  bool
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt *time.Time
}

// PropertyUnit - Unidad de propiedad (apartamento/casa)
type PropertyUnit struct {
	ID          uint
	BusinessID  uint
	Number      string
	Floor       *int
	Block       string
	UnitType    string
	Area        *float64
	Bedrooms    *int
	Bathrooms   *int
	Description string
	IsActive    bool
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// Resident - Residente de una propiedad horizontal
type Resident struct {
	ID               uint
	BusinessID       uint
	PropertyUnitID   uint
	ResidentTypeID   uint
	Name             string
	Email            string
	Phone            string
	Dni              string
	EmergencyContact string
	IsMainResident   bool
	IsActive         bool
	MoveInDate       *time.Time
	MoveOutDate      *time.Time
	LeaseStartDate   *time.Time
	LeaseEndDate     *time.Time
	MonthlyRent      *float64
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

// ResidentType - Tipo de residente
type ResidentType struct {
	ID          uint
	Name        string
	Code        string
	Description string
	IsActive    bool
}

// Committee - Comité de la propiedad horizontal
type Committee struct {
	ID              uint
	CommitteeTypeID uint
	CommitteeType   CommitteeType
	Name            string
	StartDate       time.Time
	EndDate         *time.Time
	IsActive        bool
	Notes           string
}

// CommitteeType - Tipo de comité
type CommitteeType struct {
	ID   uint
	Name string
	Code string
}

// BusinessType - Entidad de tipo de negocio (simplificada para referencias)
type BusinessType struct {
	ID          uint
	Name        string
	Code        string
	Description string
	Icon        string
	IsActive    bool
}

// ───────────────────────────────────────────
//
//	VOTING DOMAIN ENTITIES
//
// ───────────────────────────────────────────

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
	DisplayOrder int
	IsActive     bool
}

// Vote - Voto emitido por un residente
type Vote struct {
	ID             uint
	VotingID       uint
	ResidentID     uint
	VotingOptionID uint
	VotedAt        time.Time
	IPAddress      string
	UserAgent      string
	Notes          string
}
