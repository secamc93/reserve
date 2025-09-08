package domain

import (
	"mime/multipart"
	"time"
)

type LoginRequest struct {
	Email    string
	Password string
}

type LoginResponse struct {
	Success               bool
	Message               string
	User                  UserInfo
	Token                 string
	RequirePasswordChange bool
	Businesses            []BusinessInfo
}

type UserInfo struct {
	ID          uint
	Name        string
	Email       string
	Phone       string
	AvatarURL   string
	IsActive    bool
	LastLoginAt *time.Time
}

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

type BusinessInfo struct {
	ID                 uint
	Name               string
	Code               string
	BusinessTypeID     uint
	BusinessType       BusinessTypeInfo
	Timezone           string
	Address            string
	Description        string
	LogoURL            string
	PrimaryColor       string
	SecondaryColor     string
	TertiaryColor      string
	QuaternaryColor    string
	NavbarImageURL     string
	CustomDomain       string
	IsActive           bool
	EnableDelivery     bool
	EnablePickup       bool
	EnableReservations bool
}

type BusinessTypeInfo struct {
	ID          uint
	Name        string
	Code        string
	Description string
	Icon        string
}

type UserRolesPermissionsResponse struct {
	Success     bool
	Message     string
	UserID      uint
	Email       string
	IsSuper     bool
	Roles       []RoleInfo
	Permissions []PermissionInfo
}

type RoleInfo struct {
	ID          uint
	Name        string
	Code        string
	Description string
	Level       int
	IsSystem    bool
	Scope       string
}

type PermissionInfo struct {
	ID          uint
	Name        string
	Code        string
	Description string
	Resource    string
	Action      string
	Scope       string
}

type ChangePasswordRequest struct {
	UserID          uint
	CurrentPassword string
	NewPassword     string
}

type ChangePasswordResponse struct {
	Success bool
	Message string
}

type GenerateAPIKeyRequest struct {
	UserID      uint
	BusinessID  uint
	Name        string
	Description string
	RequesterID uint
}

type GenerateAPIKeyResponse struct {
	Success    bool
	Message    string
	APIKey     string
	APIKeyInfo APIKeyInfo
}

type ValidateAPIKeyRequest struct {
	APIKey string
}

type ValidateAPIKeyResponse struct {
	Success    bool
	Message    string
	UserID     uint
	Email      string
	BusinessID uint
	Roles      []string
	APIKeyID   uint
}

// RoleDTO representa un rol para casos de uso
type RoleDTO struct {
	ID          uint
	Name        string
	Code        string
	Description string
	Level       int
	IsSystem    bool
	ScopeID     uint
	ScopeName   string // Nombre del scope para mostrar
	ScopeCode   string // Código del scope para mostrar
}

// RoleFilters representa los filtros para la consulta de roles
type RoleFilters struct {
	Level int
}

// PermissionDTO representa un permiso para casos de uso
type PermissionDTO struct {
	ID          uint
	Name        string
	Code        string
	Description string
	Resource    string
	Action      string
	ScopeID     uint
	ScopeName   string // Nombre del scope para mostrar
	ScopeCode   string // Código del scope para mostrar
}

// CreatePermissionDTO representa los datos para crear un permiso
type CreatePermissionDTO struct {
	Name        string
	Code        string
	Description string
	Resource    string
	Action      string
	ScopeID     uint
}

// UpdatePermissionDTO representa los datos para actualizar un permiso
type UpdatePermissionDTO struct {
	Name        string
	Code        string
	Description string
	Resource    string
	Action      string
	ScopeID     uint
}

// PermissionListDTO representa una lista de permisos
type PermissionListDTO struct {
	Permissions []PermissionDTO
	Total       int
}

// ScopeDTO representa un scope para casos de uso
type ScopeDTO struct {
	ID          uint
	Name        string
	Code        string
	Description string
	IsSystem    bool
}

// CreateScopeDTO representa los datos para crear un scope
type CreateScopeDTO struct {
	Name        string
	Code        string
	Description string
	IsSystem    bool
}

// UpdateScopeDTO representa los datos para actualizar un scope
type UpdateScopeDTO struct {
	Name        string
	Code        string
	Description string
	IsSystem    bool
}

// ScopeListDTO representa una lista de scopes
type ScopeListDTO struct {
	Scopes []ScopeDTO
	Total  int
}

// UserQueryDTO representa un usuario para consultas sin relaciones
type UserQueryDTO struct {
	ID          uint
	Name        string
	Email       string
	Phone       string
	AvatarURL   string
	IsActive    bool
	LastLoginAt *time.Time
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   *time.Time
}

// UserDTO representa un usuario para casos de uso
type UserDTO struct {
	ID          uint
	Name        string
	Email       string
	Phone       string
	AvatarURL   string
	IsActive    bool
	LastLoginAt *time.Time
	Roles       []RoleDTO
	Businesses  []BusinessDTO
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   *time.Time
}

// CreateUserDTO representa los datos para crear un usuario
type CreateUserDTO struct {
	Name        string
	Email       string
	Password    string
	Phone       string
	AvatarURL   string                // URL completa (para compatibilidad)
	AvatarFile  *multipart.FileHeader // Archivo de imagen para subir a S3
	IsActive    bool
	RoleIDs     []uint
	BusinessIDs []uint
}

// UpdateUserDTO representa los datos para actualizar un usuario
type UpdateUserDTO struct {
	Name        string
	Email       string
	Password    string // Opcional, solo si se quiere cambiar
	Phone       string
	AvatarURL   string                // URL completa (para compatibilidad)
	AvatarFile  *multipart.FileHeader // Archivo de imagen para subir a S3
	IsActive    bool
	RoleIDs     []uint
	BusinessIDs []uint
}

// BusinessDTO representa un business para el DTO de usuario
type BusinessDTO struct {
	ID                 uint
	Name               string
	Code               string
	BusinessTypeID     uint
	Timezone           string
	Address            string
	Description        string
	LogoURL            string
	PrimaryColor       string
	SecondaryColor     string
	TertiaryColor      string
	QuaternaryColor    string
	NavbarImageURL     string
	CustomDomain       string
	IsActive           bool
	EnableDelivery     bool
	EnablePickup       bool
	EnableReservations bool
	BusinessTypeName   string
	BusinessTypeCode   string
}

// UserListDTO representa una lista paginada de usuarios
type UserListDTO struct {
	Users      []UserDTO
	Total      int64
	Page       int
	PageSize   int
	TotalPages int
}

// UserFilters representa los filtros para la consulta de usuarios
type UserFilters struct {
	Page       int
	PageSize   int
	Name       string
	Email      string
	Phone      string
	IsActive   *bool
	RoleID     *uint
	BusinessID *uint
	CreatedAt  string // formato: "2024-01-01" o "2024-01-01,2024-12-31"
	SortBy     string // "name", "email", "created_at", etc.
	SortOrder  string // "asc" o "desc"
}

type JWTClaims struct {
	UserID     uint
	Email      string
	Roles      []string
	BusinessID uint
}
