package dtos

import "time"

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
	AvatarURL   string
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
	AvatarURL   string
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
