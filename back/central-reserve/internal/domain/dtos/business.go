package dtos

import (
	"mime/multipart"
	"time"
)

// BusinessTypeRequest representa la solicitud para crear/actualizar un tipo de negocio
type BusinessTypeRequest struct {
	Name        string
	Code        string
	Description string
	Icon        string
	IsActive    bool
}

// BusinessTypeResponse representa la respuesta de un tipo de negocio
type BusinessTypeResponse struct {
	ID          uint
	Name        string
	Code        string
	Description string
	Icon        string
	IsActive    bool
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// BusinessRequest representa la solicitud para crear/actualizar un negocio
type BusinessRequest struct {
	Name           string
	Code           string
	BusinessTypeID uint
	Timezone       string
	Address        string
	Description    string

	// Configuración de marca blanca
	LogoFile        *multipart.FileHeader // Archivo de imagen para subir a S3
	PrimaryColor    string
	SecondaryColor  string
	TertiaryColor   string
	QuaternaryColor string
	NavbarImageFile *multipart.FileHeader // Imagen de navbar para subir a S3
	CustomDomain    string
	IsActive        bool

	// Configuración de funcionalidades
	EnableDelivery     bool
	EnablePickup       bool
	EnableReservations bool
}

// UpdateBusinessRequest representa actualización parcial de negocio
// Todos los campos son opcionales; los nil no modifican
type UpdateBusinessRequest struct {
	Name               *string
	Code               *string
	BusinessTypeID     *uint
	Timezone           *string
	Address            *string
	Description        *string
	LogoFile           *multipart.FileHeader
	PrimaryColor       *string
	SecondaryColor     *string
	TertiaryColor      *string
	QuaternaryColor    *string
	NavbarImageFile    *multipart.FileHeader
	CustomDomain       *string
	IsActive           *bool
	EnableDelivery     *bool
	EnablePickup       *bool
	EnableReservations *bool
}

// BusinessResponse representa la respuesta de un negocio
type BusinessResponse struct {
	ID           uint
	Name         string
	Code         string
	BusinessType BusinessTypeResponse
	Timezone     string
	Address      string
	Description  string

	// Configuración de marca blanca
	LogoURL         string
	PrimaryColor    string
	SecondaryColor  string
	TertiaryColor   string
	QuaternaryColor string
	NavbarImageURL  string
	CustomDomain    string
	IsActive        bool

	// Configuración de funcionalidades
	EnableDelivery     bool
	EnablePickup       bool
	EnableReservations bool

	CreatedAt time.Time
	UpdatedAt time.Time
}

// BusinessListResponse representa la respuesta de lista de negocios
type BusinessListResponse struct {
	Businesses []BusinessResponse
	Total      int64
	Page       int
	Limit      int
}

// BusinessTypeListResponse representa la respuesta de lista de tipos de negocio
type BusinessTypeListResponse struct {
	BusinessTypes []BusinessTypeResponse
	Total         int64
	Page          int
	Limit         int
}

// BusinessResourceConfiguredResponse representa la respuesta de recursos configurados de un negocio
type BusinessResourceConfiguredResponse struct {
	ResourceID   uint
	ResourceName string
	IsActive     bool
}

// BusinessResourcesResponse representa la respuesta completa de recursos de un negocio
type BusinessResourcesResponse struct {
	BusinessID uint
	Resources  []BusinessResourceConfiguredResponse
	Total      int
	Active     int
	Inactive   int
}
