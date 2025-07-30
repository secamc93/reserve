package dtos

import "time"

// LoginRequest representa la solicitud de login
type LoginRequest struct {
	Email    string
	Password string
}

// LoginResponse representa la respuesta simplificada del login
type LoginResponse struct {
	User                  UserInfo
	Token                 string
	RequirePasswordChange bool
	Businesses            []BusinessInfo // Lista de todos los businesses del usuario
}

// UserRolesPermissionsResponse representa la respuesta de roles y permisos del usuario
type UserRolesPermissionsResponse struct {
	IsSuper     bool
	Roles       []RoleInfo
	Permissions []PermissionInfo
}

// UserInfo representa la información del usuario
type UserInfo struct {
	ID          uint
	Name        string
	Email       string
	Phone       string
	AvatarURL   string
	IsActive    bool
	LastLoginAt *time.Time
}

// UserAuthInfo representa la información del usuario para autenticación (sin relaciones)
type UserAuthInfo struct {
	ID          uint
	Name        string
	Email       string
	Password    string
	Phone       string
	AvatarURL   string
	IsActive    bool
	LastLoginAt *time.Time
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   *time.Time
}

// RoleInfo representa la información del rol
type RoleInfo struct {
	ID          uint
	Name        string
	Code        string
	Description string
	Level       int
	Scope       string
}

// PermissionInfo representa la información del permiso
type PermissionInfo struct {
	ID          uint
	Name        string
	Code        string
	Description string
	Resource    string
	Action      string
	Scope       string
}

// ChangePasswordRequest representa la solicitud de cambio de contraseña
type ChangePasswordRequest struct {
	UserID          uint
	CurrentPassword string
	NewPassword     string
}

// ChangePasswordResponse representa la respuesta del cambio de contraseña
type ChangePasswordResponse struct {
	Success bool
	Message string
}

// GenerateAPIKeyRequest representa la solicitud para generar una API Key
type GenerateAPIKeyRequest struct {
	UserID      uint   // ID del usuario para el cual se genera la API Key
	BusinessID  uint   // ID del business al cual se asocia la API Key
	Name        string // Nombre de referencia de la API Key
	Description string // Descripción de la API Key
	RequesterID uint   // ID del usuario que solicita la creación (debe ser super admin)
}

// GenerateAPIKeyResponse representa la respuesta de generación de API Key
type GenerateAPIKeyResponse struct {
	Success    bool
	Message    string
	APIKey     string     // La API Key generada (solo se muestra una vez)
	APIKeyInfo APIKeyInfo // Información de la API Key guardada
}

// APIKeyInfo representa información de una API Key
type APIKeyInfo struct {
	ID          uint
	UserID      uint
	BusinessID  uint
	Name        string
	Description string
	RateLimit   int
	CreatedAt   time.Time
}

// ValidateAPIKeyRequest representa la solicitud para validar una API Key
type ValidateAPIKeyRequest struct {
	APIKey string // La API Key a validar
}

// ValidateAPIKeyResponse representa la respuesta de validación de API Key
type ValidateAPIKeyResponse struct {
	Valid      bool
	UserID     uint
	BusinessID uint
	Message    string
}

// BusinessInfo representa información simplificada del negocio para login
type BusinessInfo struct {
	ID                 uint
	Name               string
	Code               string
	BusinessTypeID     uint
	BusinessType       BusinessTypeInfo // Tipo de negocio incluido
	Timezone           string
	Address            string
	Description        string
	LogoURL            string
	PrimaryColor       string
	SecondaryColor     string
	CustomDomain       string
	IsActive           bool
	EnableDelivery     bool
	EnablePickup       bool
	EnableReservations bool
}

// BusinessTypeInfo representa información simplificada del tipo de negocio
type BusinessTypeInfo struct {
	ID          uint
	Name        string
	Code        string
	Description string
	Icon        string
}
