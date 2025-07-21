package dtos

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
