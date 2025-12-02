package domain

import "time"

// LoginRequest representa la solicitud de login
type LoginRequest struct {
	Email    string
	Password string
}

// LoginResponse representa la respuesta de login
type LoginResponse struct {
	Success               bool
	Message               string
	User                  UserInfo
	Token                 string
	RequirePasswordChange bool
	Businesses            []BusinessInfo
	Scope                 string // Scope del usuario (platform, business, etc.)
	IsSuperAdmin          bool   // Indica si es super admin (scope platform o scope_id 1)
}

// UserInfo representa la información básica del usuario autenticado
type UserInfo struct {
	ID          uint
	Name        string
	Email       string
	Phone       string
	AvatarURL   string
	IsActive    bool
	LastLoginAt *time.Time
}

// BusinessTypeInfo representa información de un tipo de business
type BusinessTypeInfo struct {
	ID          uint
	Name        string
	Code        string
	Description string
	Icon        string
}

// BusinessInfo representa información de un business asociado al usuario
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

// RoleInfo representa un rol en la respuesta de roles y permisos
type RoleInfo struct {
	ID          uint
	Name        string
	Code        string
	Description string
	Level       int
	IsSystem    bool
	Scope       string
}

// PermissionInfo representa un permiso en la respuesta de roles y permisos
type PermissionInfo struct {
	ID          uint
	Name        string
	Code        string
	Description string
	Resource    string
	Action      string
	Scope       string
	Active      bool // Indica si el recurso está activo para el business
}

// UserRolesPermissionsResponse representa la respuesta de roles y permisos del usuario
type UserRolesPermissionsResponse struct {
	Success          bool
	Message          string
	UserID           uint
	Email            string
	IsSuper          bool
	BusinessID       uint
	BusinessName     string
	BusinessTypeID   uint
	BusinessTypeName string
	Role             RoleInfo
	Permissions      []PermissionInfo
}

// ChangePasswordRequest representa la solicitud para cambiar contraseña
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

// GeneratePasswordRequest representa la solicitud para generar una nueva contraseña
type GeneratePasswordRequest struct {
	UserID uint
}

// GeneratePasswordResponse representa la respuesta de generación de contraseña
type GeneratePasswordResponse struct {
	Success  bool
	Email    string
	Password string
	Message  string
}

// GenerateAPIKeyRequest representa la solicitud para generar una API key
type GenerateAPIKeyRequest struct {
	UserID      uint
	BusinessID  uint
	Name        string
	Description string
	RequesterID uint
}

// APIKeyInfo representa información de una API key
type APIKeyInfo struct {
	ID          uint
	UserID      uint
	BusinessID  uint
	Name        string
	Description string
	LastUsedAt  *time.Time
	Revoked     bool
	RateLimit   int
	CreatedAt   time.Time
}

// GenerateAPIKeyResponse representa la respuesta de generación de API key
type GenerateAPIKeyResponse struct {
	Success    bool
	Message    string
	APIKey     string
	APIKeyInfo APIKeyInfo
}

// ValidateAPIKeyRequest representa la solicitud para validar una API key
type ValidateAPIKeyRequest struct {
	APIKey string
}

// ValidateAPIKeyResponse representa la respuesta de validación de API key
type ValidateAPIKeyResponse struct {
	Success    bool
	Message    string
	UserID     uint
	Email      string
	BusinessID uint
	Roles      []string
	APIKeyID   uint
}
type UsersEntity struct {
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

type APIKey struct {
	ID          uint
	UserID      uint
	BusinessID  uint
	CreatedByID uint
	Name        string
	Description string
	KeyHash     string
	LastUsedAt  *time.Time
	Revoked     bool
	RevokedAt   *time.Time
	RateLimit   int
	IPWhitelist string
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
type BusinessRoleAssignment struct {
	BusinessID uint
	RoleID     uint
}
type BusinessRoleAssignmentDetailed struct {
	BusinessID   uint
	BusinessName string
	RoleID       uint
	RoleName     string
}
type UserFilters struct {
	Page       int
	PageSize   int
	Name       string
	Email      string
	Phone      string
	UserIDs    []uint // Lista de IDs de usuarios
	IsActive   *bool
	RoleID     *uint
	BusinessID *uint
	CreatedAt  string // formato: "2024-01-01" o "2024-01-01,2024-12-31"
	SortBy     string // "id", "name", "email", "created_at", etc.
	SortOrder  string // "asc" o "desc"
}
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
type Role struct {
	ID               uint
	Name             string
	Description      string
	Level            int
	IsSystem         bool
	ScopeID          uint
	ScopeName        string
	ScopeCode        string
	BusinessTypeID   uint
	BusinessTypeName string
	CreatedAt        time.Time
	UpdatedAt        time.Time
}
