package domain

// PermissionDTO representa un permiso para casos de uso
type PermissionDTO struct {
	ID               uint
	Name             string
	Code             string
	Description      string
	Resource         string
	Action           string
	ResourceID       uint
	ActionID         uint
	ScopeID          uint
	ScopeName        string // Nombre del scope para mostrar
	ScopeCode        string // Código del scope para mostrar
	BusinessTypeID   uint   // ID del tipo de business
	BusinessTypeName string // Nombre del tipo de business
}

// CreatePermissionDTO representa los datos para crear un permiso
type CreatePermissionDTO struct {
	Name           string
	Code           string // Opcional, se genera automáticamente si no se proporciona
	Description    string
	ResourceID     uint // ID del resource
	ActionID       uint // ID de la action
	ScopeID        uint
	BusinessTypeID *uint // Opcional, nil = genérico
}

// UpdatePermissionDTO representa los datos para actualizar un permiso
type UpdatePermissionDTO struct {
	Name           string
	Code           string
	Description    string
	ResourceID     uint // ID del resource
	ActionID       uint // ID de la action
	ScopeID        uint
	BusinessTypeID *uint // Opcional, nil = genérico
}

// PermissionListDTO representa una lista de permisos
type PermissionListDTO struct {
	Permissions []PermissionDTO
	Total       int
}

// BusinessTypeInfo representa información de un tipo de business
type BusinessTypeInfo struct {
	ID   uint
	Name string
	Code string
}
