package entities

import "time"

// User representa un usuario del sistema
type User struct {
	ID          uint
	Name        string
	Email       string
	Password    string
	Phone       string
	AvatarURL   string
	IsActive    bool
	LastLoginAt *time.Time
	Roles       []Role
	Businesses  []BusinessInfo
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   *time.Time
}

// Role representa un rol del sistema
type Role struct {
	ID          uint
	Name        string
	Code        string
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
	Name        string
	Code        string
	Description string
	Resource    string
	Action      string
	ScopeID     uint
	ScopeName   string // Nombre del scope para mostrar
	ScopeCode   string // Código del scope para mostrar
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   *time.Time
}

// UserRole representa la relación many-to-many entre usuarios y roles
type UserRole struct {
	UserID    uint
	RoleID    uint
	CreatedAt time.Time
}

// UserBusiness representa la relación many-to-many entre usuarios y businesses
type UserBusiness struct {
	UserID     uint
	BusinessID uint
	CreatedAt  time.Time
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
type BusinessInfo struct {
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
	CustomDomain       string
	IsActive           bool
	EnableDelivery     bool
	EnablePickup       bool
	EnableReservations bool
	BusinessTypeName   string
	BusinessTypeCode   string
}
