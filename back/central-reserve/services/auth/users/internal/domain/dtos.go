package domain

import (
	"time"

	"central_reserve/shared/types"
)

// UserAuthInfo representa la información de autenticación de un usuario
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
	ID                      uint
	Name                    string
	Email                   string
	Phone                   string
	AvatarURL               string
	IsActive                bool
	LastLoginAt             *time.Time
	IsSuperUser             bool                             // Indica si es super usuario (scope platform)
	BusinessRoleAssignments []BusinessRoleAssignmentDetailed // Parejas business-rol con información completa
	Roles                   []RoleDTO                        // Mantener por compatibilidad
	Businesses              []BusinessDTO                    // Mantener por compatibilidad
	CreatedAt               time.Time
	UpdatedAt               time.Time
	DeletedAt               *time.Time
}

// CreateUserDTO representa los datos para crear un usuario
type CreateUserDTO struct {
	Name        string
	Email       string
	Password    string
	Phone       string
	AvatarURL   string             // URL completa (para compatibilidad)
	AvatarFile  *types.FileUpload  // Archivo de imagen para subir a S3
	IsActive    bool
	BusinessIDs []uint // Businesses a relacionar con el usuario
}

// UpdateUserDTO representa los datos para actualizar un usuario
type UpdateUserDTO struct {
	Name         string
	Email        string
	Phone        string
	AvatarURL    string             // URL completa (para compatibilidad)
	AvatarFile   *types.FileUpload  // Archivo de imagen para subir a S3
	RemoveAvatar bool
	IsActive     bool
	BusinessIDs  []uint // Businesses a mantener (sobrescribe relaciones)
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
	UserIDs    []uint // Lista de IDs de usuarios
	IsActive   *bool
	RoleID     *uint
	BusinessID *uint
	CreatedAt  string // formato: "2024-01-01" o "2024-01-01,2024-12-31"
	SortBy     string // "id", "name", "email", "created_at", etc.
	SortOrder  string // "asc" o "desc"
}

// RoleDTO representa un rol para casos de uso
type RoleDTO struct {
	ID               uint
	Name             string
	Code             string
	Description      string
	Level            int
	IsSystem         bool
	ScopeID          uint
	ScopeName        string // Nombre del scope para mostrar
	ScopeCode        string // Código del scope para mostrar
	BusinessTypeID   uint   // ID del tipo de business
	BusinessTypeName string // Nombre del tipo de business
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
	Role               *RoleDTO // Rol del usuario en este business (desde business_staff)
}

// BusinessRoleAssignment representa una asignación de rol a un negocio específico
type BusinessRoleAssignment struct {
	BusinessID uint
	RoleID     uint
}

// BusinessRoleAssignmentDetailed representa una asignación con información completa para respuestas
type BusinessRoleAssignmentDetailed struct {
	BusinessID   uint   `json:"business_id"`
	BusinessName string `json:"business_name,omitempty"`
	RoleID       uint   `json:"role_id"`
	RoleName     string `json:"role_name,omitempty"`
}
