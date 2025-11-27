package domain

import "time"

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

// ResidentUnit - Tabla pivote para relación muchos-a-muchos entre Resident y PropertyUnit
type ResidentUnit struct {
	ID             uint
	BusinessID     uint
	ResidentID     uint
	PropertyUnitID uint
	IsMainResident bool
	MoveInDate     *time.Time
	MoveOutDate    *time.Time
	LeaseStartDate *time.Time
	LeaseEndDate   *time.Time
	MonthlyRent    *float64

	// Relaciones
	Resident     *Resident
	PropertyUnit *PropertyUnit
	Business     *HorizontalProperty

	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt *time.Time
}

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
	ParticipationCoefficient *float64
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
