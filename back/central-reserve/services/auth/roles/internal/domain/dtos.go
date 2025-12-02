package domain

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

// RoleFilters representa los filtros para la consulta de roles
type RoleFilters struct {
	BusinessTypeID *uint
	ScopeID        *uint
	IsSystem       *bool
	Name           *string
	Level          *int
}

// CreateRoleDTO representa los datos para crear un nuevo rol
type CreateRoleDTO struct {
	Name           string
	Description    string
	Level          int
	IsSystem       bool
	ScopeID        uint
	BusinessTypeID uint
}

// UpdateRoleDTO representa los datos para actualizar un rol existente
type UpdateRoleDTO struct {
	Name           *string
	Description    *string
	Level          *int
	IsSystem       *bool
	ScopeID        *uint
	BusinessTypeID *uint
}
