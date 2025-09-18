package request

// CreateHorizontalPropertyRequest - Request para crear propiedad horizontal
type CreateHorizontalPropertyRequest struct {
	Name             string `json:"name" validate:"required,min=3,max=120" example:"Conjunto Residencial Los Pinos"`
	Code             string `json:"code" validate:"required,min=2,max=50" example:"los-pinos"`
	ParentBusinessID *uint  `json:"parent_business_id,omitempty"`
	Timezone         string `json:"timezone" validate:"required" example:"America/Bogota"`
	Address          string `json:"address" validate:"required,max=255" example:"Carrera 15 #45-67, Bogotá"`
	Description      string `json:"description,omitempty" validate:"max=500" example:"Conjunto residencial familiar con amplias zonas verdes"`

	// Configuración de marca blanca
	LogoURL         string `json:"logo_url,omitempty" validate:"omitempty,url" example:"https://example.com/logo.png"`
	PrimaryColor    string `json:"primary_color,omitempty" validate:"omitempty,hexcolor" example:"#1f2937"`
	SecondaryColor  string `json:"secondary_color,omitempty" validate:"omitempty,hexcolor" example:"#3b82f6"`
	TertiaryColor   string `json:"tertiary_color,omitempty" validate:"omitempty,hexcolor" example:"#10b981"`
	QuaternaryColor string `json:"quaternary_color,omitempty" validate:"omitempty,hexcolor" example:"#fbbf24"`
	NavbarImageURL  string `json:"navbar_image_url,omitempty" validate:"omitempty,url" example:"https://example.com/navbar.jpg"`
	CustomDomain    string `json:"custom_domain,omitempty" validate:"omitempty,max=100" example:"lospinos.example.com"`

	// Configuración específica para propiedades horizontales
	TotalUnits    int  `json:"total_units" validate:"required,min=1" example:"120"`
	TotalFloors   *int `json:"total_floors,omitempty" validate:"omitempty,min=1" example:"15"`
	HasElevator   bool `json:"has_elevator" example:"true"`
	HasParking    bool `json:"has_parking" example:"true"`
	HasPool       bool `json:"has_pool" example:"true"`
	HasGym        bool `json:"has_gym" example:"false"`
	HasSocialArea bool `json:"has_social_area" example:"true"`
}

// UpdateHorizontalPropertyRequest - Request para actualizar propiedad horizontal
type UpdateHorizontalPropertyRequest struct {
	Name             *string `json:"name,omitempty" validate:"omitempty,min=3,max=120" example:"Conjunto Residencial Los Pinos Actualizado"`
	Code             *string `json:"code,omitempty" validate:"omitempty,min=2,max=50" example:"los-pinos-v2"`
	ParentBusinessID *uint   `json:"parent_business_id,omitempty"`
	Timezone         *string `json:"timezone,omitempty" example:"America/Bogota"`
	Address          *string `json:"address,omitempty" validate:"omitempty,max=255" example:"Carrera 15 #45-67, Bogotá D.C."`
	Description      *string `json:"description,omitempty" validate:"omitempty,max=500" example:"Conjunto residencial familiar con amplias zonas verdes y nuevas amenidades"`

	// Configuración de marca blanca
	LogoURL         *string `json:"logo_url,omitempty" validate:"omitempty,url" example:"https://example.com/new-logo.png"`
	PrimaryColor    *string `json:"primary_color,omitempty" validate:"omitempty,hexcolor" example:"#2d3748"`
	SecondaryColor  *string `json:"secondary_color,omitempty" validate:"omitempty,hexcolor" example:"#4299e1"`
	TertiaryColor   *string `json:"tertiary_color,omitempty" validate:"omitempty,hexcolor" example:"#38b2ac"`
	QuaternaryColor *string `json:"quaternary_color,omitempty" validate:"omitempty,hexcolor" example:"#ed8936"`
	NavbarImageURL  *string `json:"navbar_image_url,omitempty" validate:"omitempty,url" example:"https://example.com/new-navbar.jpg"`
	CustomDomain    *string `json:"custom_domain,omitempty" validate:"omitempty,max=100" example:"lospinos-new.example.com"`

	// Configuración específica para propiedades horizontales
	TotalUnits    *int  `json:"total_units,omitempty" validate:"omitempty,min=1" example:"125"`
	TotalFloors   *int  `json:"total_floors,omitempty" validate:"omitempty,min=1" example:"16"`
	HasElevator   *bool `json:"has_elevator,omitempty" example:"true"`
	HasParking    *bool `json:"has_parking,omitempty" example:"true"`
	HasPool       *bool `json:"has_pool,omitempty" example:"true"`
	HasGym        *bool `json:"has_gym,omitempty" example:"true"`
	HasSocialArea *bool `json:"has_social_area,omitempty" example:"true"`
	IsActive      *bool `json:"is_active,omitempty" example:"true"`
}

// ListHorizontalPropertiesRequest - Request para listar propiedades horizontales
type ListHorizontalPropertiesRequest struct {
	Name     *string `json:"name,omitempty" form:"name" example:"Los Pinos"`
	Code     *string `json:"code,omitempty" form:"code" example:"los-pinos"`
	IsActive *bool   `json:"is_active,omitempty" form:"is_active" example:"true"`
	Page     int     `json:"page" form:"page" validate:"min=1" example:"1"`
	PageSize int     `json:"page_size" form:"page_size" validate:"min=1,max=100" example:"10"`
	OrderBy  string  `json:"order_by" form:"order_by" validate:"omitempty,oneof=name code created_at updated_at" example:"created_at"`
	OrderDir string  `json:"order_dir" form:"order_dir" validate:"omitempty,oneof=asc desc" example:"desc"`
}
