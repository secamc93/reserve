package domain

import "time"

// ═══════════════════════════════════════════════════════════════════
//
//	HORIZONTAL PROPERTY DTOs
//
// ═══════════════════════════════════════════════════════════════════

// CreateHorizontalPropertyDTO - DTO para crear una propiedad horizontal
type CreateHorizontalPropertyDTO struct {
	Name             string `json:"name" validate:"required,min=3,max=120"`
	Code             string `json:"code" validate:"required,min=2,max=50"`
	ParentBusinessID *uint  `json:"parent_business_id,omitempty"`
	Timezone         string `json:"timezone" validate:"required"`
	Address          string `json:"address" validate:"required,max=255"`
	Description      string `json:"description,omitempty" validate:"max=500"`

	// Configuración de marca blanca
	LogoURL         string `json:"logo_url,omitempty" validate:"max=255,url"`
	PrimaryColor    string `json:"primary_color,omitempty" validate:"hexcolor"`
	SecondaryColor  string `json:"secondary_color,omitempty" validate:"hexcolor"`
	TertiaryColor   string `json:"tertiary_color,omitempty" validate:"hexcolor"`
	QuaternaryColor string `json:"quaternary_color,omitempty" validate:"hexcolor"`
	NavbarImageURL  string `json:"navbar_image_url,omitempty" validate:"max=255,url"`
	CustomDomain    string `json:"custom_domain,omitempty" validate:"max=100"`

	// Configuración específica para propiedades horizontales
	TotalUnits    int  `json:"total_units" validate:"required,min=1"`
	TotalFloors   *int `json:"total_floors,omitempty" validate:"omitempty,min=1"`
	HasElevator   bool `json:"has_elevator"`
	HasParking    bool `json:"has_parking"`
	HasPool       bool `json:"has_pool"`
	HasGym        bool `json:"has_gym"`
	HasSocialArea bool `json:"has_social_area"`
}

// UpdateHorizontalPropertyDTO - DTO para actualizar una propiedad horizontal
type UpdateHorizontalPropertyDTO struct {
	Name             *string `json:"name,omitempty" validate:"omitempty,min=3,max=120"`
	Code             *string `json:"code,omitempty" validate:"omitempty,min=2,max=50,alphanum"`
	ParentBusinessID *uint   `json:"parent_business_id,omitempty"`
	Timezone         *string `json:"timezone,omitempty"`
	Address          *string `json:"address,omitempty" validate:"omitempty,max=255"`
	Description      *string `json:"description,omitempty" validate:"omitempty,max=500"`

	// Configuración de marca blanca
	LogoURL         *string `json:"logo_url,omitempty" validate:"omitempty,max=255,url"`
	PrimaryColor    *string `json:"primary_color,omitempty" validate:"omitempty,hexcolor"`
	SecondaryColor  *string `json:"secondary_color,omitempty" validate:"omitempty,hexcolor"`
	TertiaryColor   *string `json:"tertiary_color,omitempty" validate:"omitempty,hexcolor"`
	QuaternaryColor *string `json:"quaternary_color,omitempty" validate:"omitempty,hexcolor"`
	NavbarImageURL  *string `json:"navbar_image_url,omitempty" validate:"omitempty,max=255,url"`
	CustomDomain    *string `json:"custom_domain,omitempty" validate:"omitempty,max=100"`

	// Configuración específica para propiedades horizontales
	TotalUnits    *int  `json:"total_units,omitempty" validate:"omitempty,min=1"`
	TotalFloors   *int  `json:"total_floors,omitempty" validate:"omitempty,min=1"`
	HasElevator   *bool `json:"has_elevator,omitempty"`
	HasParking    *bool `json:"has_parking,omitempty"`
	HasPool       *bool `json:"has_pool,omitempty"`
	HasGym        *bool `json:"has_gym,omitempty"`
	HasSocialArea *bool `json:"has_social_area,omitempty"`
	IsActive      *bool `json:"is_active,omitempty"`
}

// HorizontalPropertyDTO - DTO para respuesta de propiedad horizontal
type HorizontalPropertyDTO struct {
	ID               uint   `json:"id"`
	Name             string `json:"name"`
	Code             string `json:"code"`
	BusinessTypeID   uint   `json:"business_type_id"`
	BusinessTypeName string `json:"business_type_name"`
	ParentBusinessID *uint  `json:"parent_business_id,omitempty"`
	Timezone         string `json:"timezone"`
	Address          string `json:"address"`
	Description      string `json:"description"`

	// Configuración de marca blanca
	LogoURL         string `json:"logo_url"`
	PrimaryColor    string `json:"primary_color"`
	SecondaryColor  string `json:"secondary_color"`
	TertiaryColor   string `json:"tertiary_color"`
	QuaternaryColor string `json:"quaternary_color"`
	NavbarImageURL  string `json:"navbar_image_url"`
	CustomDomain    string `json:"custom_domain"`

	// Configuración específica para propiedades horizontales
	TotalUnits    int  `json:"total_units"`
	TotalFloors   *int `json:"total_floors,omitempty"`
	HasElevator   bool `json:"has_elevator"`
	HasParking    bool `json:"has_parking"`
	HasPool       bool `json:"has_pool"`
	HasGym        bool `json:"has_gym"`
	HasSocialArea bool `json:"has_social_area"`

	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// HorizontalPropertyListDTO - DTO para lista de propiedades horizontales
type HorizontalPropertyListDTO struct {
	ID               uint      `json:"id"`
	Name             string    `json:"name"`
	Code             string    `json:"code"`
	BusinessTypeName string    `json:"business_type_name"`
	Address          string    `json:"address"`
	TotalUnits       int       `json:"total_units"`
	IsActive         bool      `json:"is_active"`
	CreatedAt        time.Time `json:"created_at"`
}

// HorizontalPropertyFiltersDTO - DTO para filtros de búsqueda
type HorizontalPropertyFiltersDTO struct {
	Name     *string `json:"name,omitempty"`
	Code     *string `json:"code,omitempty"`
	IsActive *bool   `json:"is_active,omitempty"`
	Page     int     `json:"page" validate:"min=1"`
	PageSize int     `json:"page_size" validate:"min=1,max=100"`
	OrderBy  string  `json:"order_by" validate:"omitempty,oneof=name code created_at updated_at"`
	OrderDir string  `json:"order_dir" validate:"omitempty,oneof=asc desc"`
}

// PaginatedHorizontalPropertyDTO - DTO para respuesta paginada
type PaginatedHorizontalPropertyDTO struct {
	Data       []HorizontalPropertyListDTO `json:"data"`
	Total      int64                       `json:"total"`
	Page       int                         `json:"page"`
	PageSize   int                         `json:"page_size"`
	TotalPages int                         `json:"total_pages"`
}
