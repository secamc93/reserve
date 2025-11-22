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
	Name       *string
	Code       *string
	IsActive   *bool
	BusinessID *uint
	Page       int
	PageSize   int
	OrderBy    string
	OrderDir   string
}

// PaginatedHorizontalPropertyDTO - DTO para respuesta paginada
type PaginatedHorizontalPropertyDTO struct {
	Data       []HorizontalPropertyListDTO
	Total      int64
	Page       int
	PageSize   int
	TotalPages int
}
