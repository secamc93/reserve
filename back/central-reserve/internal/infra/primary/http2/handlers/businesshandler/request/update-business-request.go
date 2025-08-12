package request

import "mime/multipart"

// UpdateBusinessRequest representa la solicitud para actualizar un negocio (todos los campos opcionales)
type UpdateBusinessRequest struct {
	Name           string `form:"name"`
	Code           string `form:"code"`
	BusinessTypeID uint   `form:"business_type_id"`
	Timezone       string `form:"timezone"`
	Address        string `form:"address"`
	Description    string `form:"description"`

	LogoFile       *multipart.FileHeader `form:"logo_url"`
	PrimaryColor   string                `form:"primary_color"`
	SecondaryColor string                `form:"secondary_color"`
	CustomDomain   string                `form:"custom_domain"`
	IsActive       bool                  `form:"is_active"`

	EnableDelivery     bool `form:"enable_delivery"`
	EnablePickup       bool `form:"enable_pickup"`
	EnableReservations bool `form:"enable_reservations"`
}
