package domain

import "time"

// User representa un usuario del sistema
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

// Role representa un rol del sistema
type Role struct {
	ID          uint
	Name        string
	Description string
	Level       int
	IsSystem    bool
	ScopeID     uint
	ScopeName   string // Nombre del scope para mostrar
	ScopeCode   string // Código del scope para mostrar
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   *time.Time
}

// Permission representa un permiso del sistema
type Permission struct {
	ID          uint
	Description string
	Resource    string
	Action      string
}

// UserRole representa la relación many-to-many entre usuarios y roles
type UserRole struct {
	UserID uint
	RoleID uint
}

// UserBusiness representa la relación many-to-many entre usuarios y businesses
type UserBusiness struct {
	UserID     uint
	BusinessID uint
}

// RolePermission representa la relación many-to-many entre roles y permisos
type RolePermission struct {
	RoleID       uint
	PermissionID uint
	CreatedAt    time.Time
}

// BusinessStaff representa la relación entre usuarios y negocios
type BusinessStaff struct {
	ID         uint
	UserID     uint
	BusinessID uint
	RoleID     uint
	CreatedAt  time.Time
	UpdatedAt  time.Time
	DeletedAt  *time.Time
}

// Scope representa un scope del sistema
type Scope struct {
	ID          uint
	Name        string
	Code        string
	Description string
	IsSystem    bool
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   *time.Time
}

// BusinessInfo representa un business simplificado para usuarios
type BusinessInfoEntity struct {
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

type APIKey struct {
	ID          uint       `json:"id"`
	UserID      uint       `json:"user_id"`
	BusinessID  uint       `json:"business_id"`
	CreatedByID uint       `json:"created_by_id"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	KeyHash     string     `json:"-"` // No se serializa en JSON por seguridad
	LastUsedAt  *time.Time `json:"last_used_at"`
	Revoked     bool       `json:"revoked"`
	RevokedAt   *time.Time `json:"revoked_at"`
	RateLimit   int        `json:"rate_limit"`
	IPWhitelist string     `json:"ip_whitelist"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

// APIKeyInfo representa información básica de una API Key para respuestas
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
