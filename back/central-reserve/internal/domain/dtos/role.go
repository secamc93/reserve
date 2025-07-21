package dtos

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
