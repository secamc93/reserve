package request

import "mime/multipart"

// CreateHorizontalPropertyRequest - Request para crear propiedad horizontal
type CreateHorizontalPropertyRequest struct {
	Name             string `form:"name" validate:"required,min=3,max=120"`
	Code             string `form:"code"` // Opcional, se genera automáticamente del nombre si está vacío
	ParentBusinessID *uint  `form:"parent_business_id"`
	Timezone         string `form:"timezone"` // Opcional, usa America/Bogota por defecto
	Address          string `form:"address" validate:"required,max=255"`
	Description      string `form:"description" validate:"max=500"`

	// Configuración de marca blanca - Archivos para subir a S3
	LogoFile        *multipart.FileHeader `form:"logo_file"`
	NavbarImageFile *multipart.FileHeader `form:"navbar_image_file"`

	PrimaryColor    string `form:"primary_color" validate:"omitempty,hexcolor"`
	SecondaryColor  string `form:"secondary_color" validate:"omitempty,hexcolor"`
	TertiaryColor   string `form:"tertiary_color" validate:"omitempty,hexcolor"`
	QuaternaryColor string `form:"quaternary_color" validate:"omitempty,hexcolor"`
	CustomDomain    string `form:"custom_domain" validate:"omitempty,max=100"`

	// Configuración específica para propiedades horizontales
	TotalUnits    int  `form:"total_units" validate:"omitempty,min=0"`  // Opcional, por defecto 0
	TotalFloors   *int `form:"total_floors" validate:"omitempty,min=0"` // Opcional
	HasElevator   bool `form:"has_elevator"`
	HasParking    bool `form:"has_parking"`
	HasPool       bool `form:"has_pool"`
	HasGym        bool `form:"has_gym"`
	HasSocialArea bool `form:"has_social_area"`

	// Opciones de configuración inicial automática
	CreateUnits              bool   `form:"create_units"`
	UnitPrefix               string `form:"unit_prefix"`
	UnitType                 string `form:"unit_type"`
	UnitsPerFloor            *int   `form:"units_per_floor"`
	StartUnitNumber          int    `form:"start_unit_number"`
	CreateRequiredCommittees bool   `form:"create_required_committees"`
}

// UpdateHorizontalPropertyRequest - Request para actualizar propiedad horizontal
type UpdateHorizontalPropertyRequest struct {
	Name             *string `form:"name" validate:"omitempty,min=3,max=120"`
	Code             *string `form:"code" validate:"omitempty,min=2,max=50"`
	ParentBusinessID *uint   `form:"parent_business_id"`
	Timezone         *string `form:"timezone"`
	Address          *string `form:"address" validate:"omitempty,max=255"`
	Description      *string `form:"description" validate:"omitempty,max=500"`

	// Configuración de marca blanca - Archivos para S3
	LogoFile        *multipart.FileHeader `form:"logo_file"`
	NavbarImageFile *multipart.FileHeader `form:"navbar_image_file"`

	PrimaryColor    *string `form:"primary_color" validate:"omitempty,hexcolor"`
	SecondaryColor  *string `form:"secondary_color" validate:"omitempty,hexcolor"`
	TertiaryColor   *string `form:"tertiary_color" validate:"omitempty,hexcolor"`
	QuaternaryColor *string `form:"quaternary_color" validate:"omitempty,hexcolor"`
	CustomDomain    *string `form:"custom_domain" validate:"omitempty,max=100"`

	// Configuración específica para propiedades horizontales
	TotalUnits    *int  `form:"total_units" validate:"omitempty,min=1"`
	TotalFloors   *int  `form:"total_floors" validate:"omitempty,min=1"`
	HasElevator   *bool `form:"has_elevator"`
	HasParking    *bool `form:"has_parking"`
	HasPool       *bool `form:"has_pool"`
	HasGym        *bool `form:"has_gym"`
	HasSocialArea *bool `form:"has_social_area"`
	IsActive      *bool `form:"is_active"`
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
