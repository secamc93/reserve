package response

import "time"

// HorizontalPropertyResponse - Respuesta para propiedad horizontal
type HorizontalPropertyResponse struct {
	ID               uint   `json:"id" example:"1"`
	Name             string `json:"name" example:"Conjunto Residencial Los Pinos"`
	Code             string `json:"code" example:"los-pinos"`
	BusinessTypeID   uint   `json:"business_type_id" example:"1"`
	BusinessTypeName string `json:"business_type_name" example:"Propiedad Horizontal"`
	ParentBusinessID *uint  `json:"parent_business_id,omitempty"`
	Timezone         string `json:"timezone" example:"America/Bogota"`
	Address          string `json:"address" example:"Carrera 15 #45-67, Bogotá"`
	Description      string `json:"description" example:"Conjunto residencial familiar con amplias zonas verdes"`

	// Configuración de marca blanca
	LogoURL         string `json:"logo_url" example:"https://example.com/logo.png"`
	PrimaryColor    string `json:"primary_color" example:"#1f2937"`
	SecondaryColor  string `json:"secondary_color" example:"#3b82f6"`
	TertiaryColor   string `json:"tertiary_color" example:"#10b981"`
	QuaternaryColor string `json:"quaternary_color" example:"#fbbf24"`
	NavbarImageURL  string `json:"navbar_image_url" example:"https://example.com/navbar.jpg"`
	CustomDomain    string `json:"custom_domain" example:"lospinos.example.com"`

	// Configuración específica para propiedades horizontales
	TotalUnits    int  `json:"total_units" example:"120"`
	TotalFloors   *int `json:"total_floors,omitempty" example:"15"`
	HasElevator   bool `json:"has_elevator" example:"true"`
	HasParking    bool `json:"has_parking" example:"true"`
	HasPool       bool `json:"has_pool" example:"true"`
	HasGym        bool `json:"has_gym" example:"false"`
	HasSocialArea bool `json:"has_social_area" example:"true"`

	// Información detallada (solo en GET by ID)
	PropertyUnits []PropertyUnitResponse `json:"property_units"`
	Committees    []CommitteeResponse    `json:"committees"`

	IsActive  bool      `json:"is_active" example:"true"`
	CreatedAt time.Time `json:"created_at" example:"2024-01-15T10:30:00Z"`
	UpdatedAt time.Time `json:"updated_at" example:"2024-01-15T10:30:00Z"`
}

// PropertyUnitResponse - Respuesta para una unidad de propiedad
type PropertyUnitResponse struct {
	ID          uint     `json:"id" example:"1"`
	Number      string   `json:"number" example:"101"`
	Floor       *int     `json:"floor,omitempty" example:"1"`
	Block       string   `json:"block,omitempty" example:"A"`
	UnitType    string   `json:"unit_type" example:"apartment"`
	Area        *float64 `json:"area,omitempty" example:"85.5"`
	Bedrooms    *int     `json:"bedrooms,omitempty" example:"3"`
	Bathrooms   *int     `json:"bathrooms,omitempty" example:"2"`
	Description string   `json:"description,omitempty" example:"Apto 101 - Piso 1"`
	IsActive    bool     `json:"is_active" example:"true"`
}

// CommitteeResponse - Respuesta para un comité
type CommitteeResponse struct {
	ID              uint       `json:"id" example:"1"`
	CommitteeTypeID uint       `json:"committee_type_id" example:"1"`
	TypeName        string     `json:"type_name" example:"Consejo de Administración"`
	TypeCode        string     `json:"type_code" example:"admin_council"`
	Name            string     `json:"name" example:"Consejo de Administración 2025"`
	StartDate       time.Time  `json:"start_date" example:"2025-01-01T00:00:00Z"`
	EndDate         *time.Time `json:"end_date,omitempty" example:"2026-12-31T23:59:59Z"`
	IsActive        bool       `json:"is_active" example:"true"`
	Notes           string     `json:"notes,omitempty" example:"Comité creado automáticamente"`
}

// HorizontalPropertyListResponse - Respuesta para lista de propiedades horizontales
type HorizontalPropertyListResponse struct {
	ID               uint      `json:"id" example:"1"`
	Name             string    `json:"name" example:"Conjunto Residencial Los Pinos"`
	Code             string    `json:"code" example:"los-pinos"`
	BusinessTypeName string    `json:"business_type_name" example:"Propiedad Horizontal"`
	Address          string    `json:"address" example:"Carrera 15 #45-67, Bogotá"`
	TotalUnits       int       `json:"total_units" example:"120"`
	IsActive         bool      `json:"is_active" example:"true"`
	CreatedAt        time.Time `json:"created_at" example:"2024-01-15T10:30:00Z"`
}

// PaginatedHorizontalPropertyResponse - Respuesta paginada para propiedades horizontales
type PaginatedHorizontalPropertyResponse struct {
	Data       []HorizontalPropertyListResponse `json:"data"`
	Total      int64                            `json:"total" example:"150"`
	Page       int                              `json:"page" example:"1"`
	PageSize   int                              `json:"page_size" example:"10"`
	TotalPages int                              `json:"total_pages" example:"15"`
}

// HorizontalPropertySuccessResponse - Respuesta de éxito para una propiedad horizontal
type HorizontalPropertySuccessResponse struct {
	Success bool                       `json:"success" example:"true"`
	Message string                     `json:"message" example:"Operación realizada exitosamente"`
	Data    HorizontalPropertyResponse `json:"data"`
}

// HorizontalPropertyListSuccessResponse - Respuesta de éxito para lista paginada
type HorizontalPropertyListSuccessResponse struct {
	Success bool                                `json:"success" example:"true"`
	Message string                              `json:"message" example:"Lista obtenida exitosamente"`
	Data    PaginatedHorizontalPropertyResponse `json:"data"`
}

// HorizontalPropertyDeleteSuccessResponse - Respuesta de éxito para eliminación
type HorizontalPropertyDeleteSuccessResponse struct {
	Success bool   `json:"success" example:"true"`
	Message string `json:"message" example:"Propiedad horizontal eliminada exitosamente"`
}

// ErrorResponse - Respuesta genérica de error
type ErrorResponse struct {
	Success bool   `json:"success" example:"false"`
	Message string `json:"message" example:"Error en la operación"`
	Error   string `json:"error,omitempty" example:"Detalles del error"`
}
