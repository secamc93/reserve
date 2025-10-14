package domain

import (
	"mime/multipart"
	"time"
)

// ═══════════════════════════════════════════════════════════════════
//
//	HORIZONTAL PROPERTY DTOs
//
// ═══════════════════════════════════════════════════════════════════

// CreateHorizontalPropertyDTO - DTO para crear una propiedad horizontal
type CreateHorizontalPropertyDTO struct {
	Name             string
	Code             string
	ParentBusinessID *uint
	Timezone         string
	Address          string
	Description      string

	// Configuración de marca blanca - Archivos para S3
	LogoFile        *multipart.FileHeader
	NavbarImageFile *multipart.FileHeader

	PrimaryColor    string
	SecondaryColor  string
	TertiaryColor   string
	QuaternaryColor string
	CustomDomain    string

	// Configuración específica para propiedades horizontales
	TotalUnits    int
	TotalFloors   *int
	HasElevator   bool
	HasParking    bool
	HasPool       bool
	HasGym        bool
	HasSocialArea bool

	// Opciones de configuración inicial automática
	SetupOptions *HorizontalPropertySetupOptions
}

// HorizontalPropertySetupOptions - Opciones para configuración inicial automática
type HorizontalPropertySetupOptions struct {
	CreateUnits              bool
	UnitPrefix               string
	UnitType                 string
	UnitsPerFloor            *int
	StartUnitNumber          int
	CreateRequiredCommittees bool
}

// UpdateHorizontalPropertyDTO - DTO para actualizar una propiedad horizontal
type UpdateHorizontalPropertyDTO struct {
	Name             *string
	Code             *string
	ParentBusinessID *uint
	Timezone         *string
	Address          *string
	Description      *string

	// Configuración de marca blanca
	LogoFile        *multipart.FileHeader
	NavbarImageFile *multipart.FileHeader
	PrimaryColor    *string
	SecondaryColor  *string
	TertiaryColor   *string
	QuaternaryColor *string
	CustomDomain    *string

	// Configuración específica para propiedades horizontales
	TotalUnits    *int
	TotalFloors   *int
	HasElevator   *bool
	HasParking    *bool
	HasPool       *bool
	HasGym        *bool
	HasSocialArea *bool
	IsActive      *bool
}

// HorizontalPropertyDTO - DTO para respuesta de propiedad horizontal
type HorizontalPropertyDTO struct {
	ID               uint
	Name             string
	Code             string
	BusinessTypeID   uint
	BusinessTypeName string
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

	// Configuración específica para propiedades horizontales
	TotalUnits    int
	TotalFloors   *int
	HasElevator   bool
	HasParking    bool
	HasPool       bool
	HasGym        bool
	HasSocialArea bool

	// Información detallada (solo en GET by ID)
	PropertyUnits []PropertyUnitDTO
	Committees    []CommitteeDTO

	IsActive  bool
	CreatedAt time.Time
	UpdatedAt time.Time
}

// PropertyUnitDTO - DTO para unidades de propiedad
type PropertyUnitDTO struct {
	ID          uint
	Number      string
	Floor       *int
	Block       string
	UnitType    string
	Area        *float64
	Bedrooms    *int
	Bathrooms   *int
	Description string
	IsActive    bool
}

// CommitteeDTO - DTO para comités
type CommitteeDTO struct {
	ID              uint
	CommitteeTypeID uint
	TypeName        string
	TypeCode        string
	Name            string
	StartDate       time.Time
	EndDate         *time.Time
	IsActive        bool
	Notes           string
}

// HorizontalPropertyListDTO - DTO para lista de propiedades horizontales
type HorizontalPropertyListDTO struct {
	ID               uint
	Name             string
	Code             string
	BusinessTypeName string
	Address          string
	TotalUnits       int
	LogoURL          string
	NavbarImageURL   string
	IsActive         bool
	CreatedAt        time.Time
}

// HorizontalPropertyFiltersDTO - DTO para filtros de búsqueda
type HorizontalPropertyFiltersDTO struct {
	Name     *string
	Code     *string
	IsActive *bool
	Page     int
	PageSize int
	OrderBy  string
	OrderDir string
}

// PaginatedHorizontalPropertyDTO - DTO para respuesta paginada
type PaginatedHorizontalPropertyDTO struct {
	Data       []HorizontalPropertyListDTO
	Total      int64
	Page       int
	PageSize   int
	TotalPages int
}

// ═══════════════════════════════════════════════════════════════════
//
//  VOTING DTOs
//
// ═══════════════════════════════════════════════════════════════════

// CreateVotingGroupDTO - DTO para crear un grupo de votaciones
type CreateVotingGroupDTO struct {
	BusinessID       uint
	Name             string
	Description      string
	VotingStartDate  time.Time
	VotingEndDate    time.Time
	RequiresQuorum   bool
	QuorumPercentage *float64
	CreatedByUserID  *uint
	Notes            string
}

// VotingGroupDTO - DTO para respuesta de grupo de votaciones
type VotingGroupDTO struct {
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
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

// CreateVotingDTO - DTO para crear una votación
type CreateVotingDTO struct {
	VotingGroupID      uint
	Title              string
	Description        string
	VotingType         string
	IsSecret           bool
	AllowAbstention    bool
	DisplayOrder       int
	RequiredPercentage *float64
}

// VotingDTO - DTO para respuesta de una votación
type VotingDTO struct {
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
	CreatedAt          time.Time
	UpdatedAt          time.Time
	Options            []VotingOptionDTO
}

// CreateVotingOptionDTO - DTO para crear una opción de votación
type CreateVotingOptionDTO struct {
	VotingID     uint
	OptionText   string
	OptionCode   string
	DisplayOrder int
}

// VotingOptionDTO - DTO para respuesta de opción de votación
type VotingOptionDTO struct {
	ID           uint
	VotingID     uint
	OptionText   string
	OptionCode   string
	DisplayOrder int
	IsActive     bool
}

// CreateVoteDTO - DTO para emitir un voto
type CreateVoteDTO struct {
	VotingID       uint
	ResidentID     uint
	VotingOptionID uint
	IPAddress      string
	UserAgent      string
	Notes          string
}

// VoteDTO - DTO para respuesta de voto
type VoteDTO struct {
	ID             uint
	VotingID       uint
	ResidentID     uint
	VotingOptionID uint
	OptionText     string
	OptionCode     string
	VotedAt        time.Time
	IPAddress      string
	UserAgent      string
	Notes          string
}

// VotingResultDTO - DTO para resultados de votación
type VotingResultDTO struct {
	VotingOptionID uint
	OptionText     string
	OptionCode     string
	VoteCount      int
	Percentage     float64
}

// VotingDetailByUnitDTO - DTO para detalle de votación por unidad
type VotingDetailByUnitDTO struct {
	PropertyUnitID           uint
	PropertyUnitNumber       string
	ParticipationCoefficient *float64
	ResidentID               *uint
	ResidentName             *string
	HasVoted                 bool
	VotingOptionID           *uint
	OptionText               *string
	OptionCode               *string
	VotedAt                  *string
}

// UnitWithResidentDTO - DTO simple para unidad con su residente principal
type UnitWithResidentDTO struct {
	PropertyUnitID     uint
	PropertyUnitNumber string
	ResidentID         *uint
	ResidentName       *string
}

// ───────────────────────────────────────────
// PROPERTY UNIT DTOs
// ───────────────────────────────────────────

// CreatePropertyUnitDTO - DTO para crear unidad de propiedad
type CreatePropertyUnitDTO struct {
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
}

// UpdatePropertyUnitDTO - DTO para actualizar unidad de propiedad
type UpdatePropertyUnitDTO struct {
	Number                   *string
	Floor                    *int
	Block                    *string
	UnitType                 *string
	Area                     *float64
	Bedrooms                 *int
	Bathrooms                *int
	ParticipationCoefficient *float64
	Description              *string
	IsActive                 *bool
}

// PropertyUnitDetailDTO - DTO para respuesta detallada de unidad
type PropertyUnitDetailDTO struct {
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

// PropertyUnitListDTO - DTO para listado de unidades
type PropertyUnitListDTO struct {
	ID                       uint
	Number                   string
	Floor                    *int
	Block                    string
	UnitType                 string
	Area                     *float64
	Bedrooms                 *int
	Bathrooms                *int
	ParticipationCoefficient *float64
	IsActive                 bool
}

// PropertyUnitFiltersDTO - DTO para filtros de búsqueda
type PropertyUnitFiltersDTO struct {
	BusinessID uint
	Number     string
	UnitType   string
	Floor      *int
	Block      string
	IsActive   *bool
	Page       int
	PageSize   int
}

// PaginatedPropertyUnitsDTO - DTO para respuesta paginada
type PaginatedPropertyUnitsDTO struct {
	Units      []PropertyUnitListDTO
	Total      int64
	Page       int
	PageSize   int
	TotalPages int
}

// ImportPropertyUnitsResult - Resultado de la importación de unidades
type ImportPropertyUnitsResult struct {
	Total   int
	Created int
	Skipped int
	Errors  []string
}

// ───────────────────────────────────────────
// RESIDENT DTOs
// ───────────────────────────────────────────

// ImportResidentsResult - Resultado de la importación de residentes
type ImportResidentsResult struct {
	Total   int
	Created int
	Errors  []string
}

// ResidentBasicDTO - DTO básico de residente para validación pública
type ResidentBasicDTO struct {
	ID                 uint
	Name               string
	PropertyUnitID     uint
	PropertyUnitNumber string
}

// CreateResidentDTO - DTO para crear residente
type CreateResidentDTO struct {
	BusinessID       uint
	PropertyUnitID   uint
	ResidentTypeID   uint
	Name             string
	Email            string
	Phone            string
	Dni              string
	EmergencyContact string
	IsMainResident   bool
	MoveInDate       *time.Time
	LeaseStartDate   *time.Time
	LeaseEndDate     *time.Time
	MonthlyRent      *float64
}

// UpdateResidentDTO - DTO para actualizar residente
type UpdateResidentDTO struct {
	PropertyUnitID   *uint
	ResidentTypeID   *uint
	Name             *string
	Email            *string
	Phone            *string
	Dni              *string
	EmergencyContact *string
	IsMainResident   *bool
	IsActive         *bool
	MoveInDate       *time.Time
	MoveOutDate      *time.Time
	LeaseStartDate   *time.Time
	LeaseEndDate     *time.Time
	MonthlyRent      *float64
}

// ResidentDetailDTO - DTO para respuesta detallada de residente
type ResidentDetailDTO struct {
	ID                 uint
	BusinessID         uint
	PropertyUnitID     uint
	PropertyUnitNumber string
	ResidentTypeID     uint
	ResidentTypeName   string
	ResidentTypeCode   string
	Name               string
	Email              string
	Phone              string
	Dni                string
	EmergencyContact   string
	IsMainResident     bool
	IsActive           bool
	MoveInDate         *time.Time
	MoveOutDate        *time.Time
	LeaseStartDate     *time.Time
	LeaseEndDate       *time.Time
	MonthlyRent        *float64
	CreatedAt          time.Time
	UpdatedAt          time.Time
}

// ResidentListDTO - DTO para listado de residentes
type ResidentListDTO struct {
	ID                 uint
	PropertyUnitNumber string
	ResidentTypeName   string
	Name               string
	Email              string
	Phone              string
	IsMainResident     bool
	IsActive           bool
}

// ResidentFiltersDTO - DTO para filtros de búsqueda
type ResidentFiltersDTO struct {
	BusinessID         uint
	PropertyUnitNumber string
	Name               string
	PropertyUnitID     *uint
	ResidentTypeID     *uint
	IsActive           *bool
	IsMainResident     *bool
	Page               int
	PageSize           int
}

// PaginatedResidentsDTO - DTO para respuesta paginada
type PaginatedResidentsDTO struct {
	Residents  []ResidentListDTO
	Total      int64
	Page       int
	PageSize   int
	TotalPages int
}
