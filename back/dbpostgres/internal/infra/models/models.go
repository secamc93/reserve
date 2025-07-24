package models

import (
	"time"

	"gorm.io/gorm"
)

// ───────────────────────────────────────────
//
//	BUSINESS TYPES - Tipos de negocios
//
// ───────────────────────────────────────────
type BusinessType struct {
	gorm.Model
	Name        string `gorm:"size:100;not null;unique"`
	Code        string `gorm:"size:50;not null;unique"` // Código interno
	Description string `gorm:"size:500"`
	Icon        string `gorm:"size:100"` // Icono para UI
	IsActive    bool   `gorm:"default:true"`

	// Relación con negocios
	Businesses []Business
}

// ───────────────────────────────────────────
//
//	SCOPES - Ámbitos de permisos y roles
//
// ───────────────────────────────────────────
type Scope struct {
	gorm.Model
	Name        string `gorm:"size:100;not null;unique"`
	Code        string `gorm:"size:50;not null;unique"` // Código interno
	Description string `gorm:"size:500"`
	IsSystem    bool   `gorm:"default:false"` // Si es scope del sistema (no se puede eliminar)

	// Relaciones
	Roles       []Role       `gorm:"foreignKey:ScopeID"`
	Permissions []Permission `gorm:"foreignKey:ScopeID"`
}

// ───────────────────────────────────────────
//
//	BUSINESSES  (multi-tenant) - MARCA BLANCA
//
// ───────────────────────────────────────────
type Business struct {
	gorm.Model
	Name           string `gorm:"size:120;not null"`
	Code           string `gorm:"size:50;not null;unique"` // slug para URL personalizada
	BusinessTypeID uint   `gorm:"not null;index"`
	Timezone       string `gorm:"size:40;default:'America/Bogota'"`
	Address        string `gorm:"size:255"`
	Description    string `gorm:"size:500"`

	// Configuración de marca blanca
	LogoURL        string `gorm:"size:255"`
	PrimaryColor   string `gorm:"size:7;default:'#1f2937'"` // Hex color
	SecondaryColor string `gorm:"size:7;default:'#3b82f6'"` // Hex color
	CustomDomain   string `gorm:"size:100;unique"`          // dominio personalizado
	IsActive       bool   `gorm:"default:true"`

	// Configuración de funcionalidades
	EnableDelivery     bool `gorm:"default:false"`
	EnablePickup       bool `gorm:"default:false"`
	EnableReservations bool `gorm:"default:true"`

	// Relaciones
	BusinessType BusinessType
	Rooms        []Room
	Tables       []Table
	Reservations []Reservation
	Staff        []BusinessStaff
	Clients      []Client
	Users        []User `gorm:"many2many:user_businesses;"` // Usuarios del negocio (muchos a muchos)
}

// ───────────────────────────────────────────
//
//	ROOMS – salas dentro de un negocio
//
// ───────────────────────────────────────────
type Room struct {
	gorm.Model
	BusinessID  uint   `gorm:"not null;index;uniqueIndex:idx_business_room_name,priority:1"`
	Name        string `gorm:"size:100;not null;uniqueIndex:idx_business_room_name,priority:2"`
	Code        string `gorm:"size:50;not null;uniqueIndex:idx_business_room_code,priority:2"` // Código interno de la sala
	Description string `gorm:"size:500"`
	Capacity    int    `gorm:"not null"` // Capacidad total de la sala
	IsActive    bool   `gorm:"default:true"`

	// Configuración de la sala
	MinCapacity int `gorm:"default:1"` // Capacidad mínima para reservar
	MaxCapacity int `gorm:"default:0"` // Capacidad máxima (0 = sin límite)

	// Relaciones
	Business     Business `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Tables       []Table  `gorm:"foreignKey:RoomID"` // Una sala puede tener varias mesas
	Reservations []Reservation
}

// ───────────────────────────────────────────
//
//	ROLES DEL SISTEMA
//
// ───────────────────────────────────────────
type Role struct {
	gorm.Model
	Name        string `gorm:"size:50;not null;unique"`
	Code        string `gorm:"size:30;not null;unique"` // Código interno
	Description string `gorm:"size:255"`
	Level       int    `gorm:"not null;default:1"` // Nivel jerárquico (1=super, 2=admin, 3=manager, 4=staff)
	IsSystem    bool   `gorm:"default:false"`      // Si es rol del sistema (no se puede eliminar)

	// Scope del rol
	ScopeID uint  `gorm:"not null;index"`
	Scope   Scope `gorm:"foreignKey:ScopeID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`

	Permissions []Permission `gorm:"many2many:role_permissions;"`
	Users       []User       `gorm:"many2many:user_roles;"`
}

// ───────────────────────────────────────────
//
//	PERMISOS DEL SISTEMA
//
// ───────────────────────────────────────────
type Permission struct {
	gorm.Model
	Name        string `gorm:"size:100;not null;unique"`
	Code        string `gorm:"size:50;not null;unique"` // Código interno
	Description string `gorm:"size:255"`
	Resource    string `gorm:"size:50;not null"` // Recurso: 'businesses', 'users', 'reservations', etc.
	Action      string `gorm:"size:20;not null"` // Acción: 'create', 'read', 'update', 'delete', 'manage'
	ScopeID     uint   `gorm:"not null;index"`   // Referencia al scope

	Scope Scope  `gorm:"foreignKey:ScopeID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	Roles []Role `gorm:"many2many:role_permissions;"`
}

// ───────────────────────────────────────────
//
//	USUARIOS DEL SISTEMA
//
// ───────────────────────────────────────────
type User struct {
	gorm.Model
	Name        string `gorm:"size:255;not null"`
	Email       string `gorm:"size:255;not null;unique"`
	Password    string `gorm:"size:255;not null"`
	Phone       string `gorm:"size:20"`
	AvatarURL   string `gorm:"size:255"`
	IsActive    bool   `gorm:"default:true"`
	LastLoginAt *time.Time

	// Relación con negocios (un usuario puede estar en múltiples negocios)
	Businesses []Business `gorm:"many2many:user_businesses;"`

	// Roles del usuario (RELACIÓN MANY-TO-MANY)
	Roles []Role `gorm:"many2many:user_roles;"`

	// Relaciones existentes
	StaffOf []BusinessStaff
}

// ───────────────────────────────────────────
//
//	BUSINESS STAFF  (N:M usuario ↔ negocio)
//
// ───────────────────────────────────────────
type BusinessStaff struct {
	gorm.Model
	UserID     uint `gorm:"not null;index;uniqueIndex:idx_user_business,priority:1"`
	BusinessID uint `gorm:"not null;index;uniqueIndex:idx_user_business,priority:2"`
	RoleID     uint `gorm:"not null;index"` // Ahora referencia a Role en lugar de string

	User     User     `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Business Business `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Role     Role     `gorm:"foreignKey:RoleID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
}

// ───────────────────────────────────────────
//
//	CLIENTS – personas que hacen la reserva
//
// ───────────────────────────────────────────
type Client struct {
	gorm.Model
	BusinessID uint    `gorm:"not null;index;uniqueIndex:idx_business_client_email,priority:1"`
	Name       string  `gorm:"size:255;not null"`
	Email      string  `gorm:"size:255;uniqueIndex:idx_business_client_email,priority:2"`
	Phone      string  `gorm:"size:20"`
	Dni        *string `gorm:"size:30;uniqueIndex:idx_business_client_dni,priority:2"`

	Reservations []Reservation
	Business     Business `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

// ───────────────────────────────────────────
//
//	TABLES – mesas físicas
//
// ───────────────────────────────────────────
type Table struct {
	gorm.Model
	BusinessID uint  `gorm:"not null;index;uniqueIndex:idx_business_table_number,priority:1"`
	Number     int   `gorm:"not null;uniqueIndex:idx_business_table_number,priority:2"`
	Capacity   int   `gorm:"not null"`
	RoomID     *uint `gorm:"index"` // Relación opcional con sala (nullable)

	Business     Business `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Room         *Room    `gorm:"foreignKey:RoomID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"` // Relación opcional
	Reservations []Reservation
}

// ───────────────────────────────────────────
//
//	RESERVATIONS
//
// ───────────────────────────────────────────
type Reservation struct {
	gorm.Model
	BusinessID uint  `gorm:"not null;index"`
	RoomID     *uint `gorm:"index"` // Relación opcional con sala (nullable)
	TableID    *uint `gorm:"index"`
	ClientID   uint  `gorm:"not null;index"`
	// Opcional: quién registró la reserva (empleado o sistema)
	CreatedByUserID *uint `gorm:"index"`

	StartAt        time.Time `gorm:"not null;index"`
	EndAt          time.Time `gorm:"not null"`
	NumberOfGuests int       `gorm:"not null"`
	StatusID       uint      `gorm:"not null;index"`

	Business  Business          `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Room      *Room             `gorm:"foreignKey:RoomID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"` // Relación opcional
	Table     Table             `gorm:"foreignKey:TableID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Client    Client            `gorm:"foreignKey:ClientID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	CreatedBy User              `gorm:"foreignKey:CreatedByUserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	Status    ReservationStatus `gorm:"foreignKey:StatusID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
}

// ───────────────────────────────────────────
//
//	RESERVATION STATUS
//
// ───────────────────────────────────────────
type ReservationStatus struct {
	gorm.Model
	Code string `gorm:"size:20;unique;not null"` // Ej: "asignado"
	Name string `gorm:"size:50;not null"`        // Ej: "Asignado"
}

// ───────────────────────────────────────────
//
//	RESERVATION STATUS HISTORY
//
// ───────────────────────────────────────────
type ReservationStatusHistory struct {
	gorm.Model
	ReservationID   uint  `gorm:"not null;index"`
	TableID         *uint `gorm:"index"` // Ahora opcional (nullable)
	StatusID        uint  `gorm:"not null;index"`
	ChangedByUserID *uint `gorm:"index"` // Quién hizo el cambio (puede ser null si fue automático)

	Reservation Reservation       `gorm:"foreignKey:ReservationID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Status      ReservationStatus `gorm:"foreignKey:StatusID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	ChangedBy   User              `gorm:"foreignKey:ChangedByUserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
}

// ───────────────────────────────────────────
//
//	CONSTANTES Y ENUMS
//
// ───────────────────────────────────────────

// Acciones del sistema (operaciones que se pueden realizar)
const (
	ACTION_CREATE = "create" // Crear nuevos registros
	ACTION_READ   = "read"   // Leer/ver información
	ACTION_UPDATE = "update" // Modificar registros existentes
	ACTION_DELETE = "delete" // Eliminar registros
	ACTION_MANAGE = "manage" // Control total (incluye todas las acciones)
)
