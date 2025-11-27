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
	ID                       uint
	BusinessID               uint
	Number                   string
	Floor                    *int
	Block                    string
	UnitType                 string
	Area                     *float64
	Bedrooms                 *int
	Bathrooms                *int
	ParticipationCoefficient *float64 // Coeficiente de participación para votaciones
	Description              string
	IsActive                 bool
	CreatedAt                time.Time
	UpdatedAt                time.Time
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
