package domain

import "time"

// ═══════════════════════════════════════════════════════════════════
//
//	HORIZONTAL PROPERTY ENTITIES
//
// ═══════════════════════════════════════════════════════════════════

// HorizontalProperty - Entidad de propiedad horizontal
type HorizontalProperty struct {
	ID               uint   `json:"id"`
	Name             string `json:"name"`
	Code             string `json:"code"`
	BusinessTypeID   uint   `json:"business_type_id"`
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

	// Configuración de funcionalidades (heredada de Business)
	EnableDelivery     bool `json:"enable_delivery"`
	EnablePickup       bool `json:"enable_pickup"`
	EnableReservations bool `json:"enable_reservations"`

	// Configuración específica para propiedades horizontales
	TotalUnits    int  `json:"total_units"`
	TotalFloors   *int `json:"total_floors,omitempty"`
	HasElevator   bool `json:"has_elevator"`
	HasParking    bool `json:"has_parking"`
	HasPool       bool `json:"has_pool"`
	HasGym        bool `json:"has_gym"`
	HasSocialArea bool `json:"has_social_area"`

	IsActive  bool       `json:"is_active"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at,omitempty"`
}

// BusinessType - Entidad de tipo de negocio (simplificada para referencias)
type BusinessType struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Code        string `json:"code"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
	IsActive    bool   `json:"is_active"`
}
