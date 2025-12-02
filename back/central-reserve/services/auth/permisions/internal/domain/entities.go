package domain

// Permission representa un permiso del sistema
type Permission struct {
	ID               uint
	Name             string
	Code             string
	Description      string
	Resource         string
	Action           string
	ResourceID       uint
	ActionID         uint // ID de la acción
	ScopeID          uint
	ScopeName        string
	ScopeCode        string
	BusinessTypeID   uint
	BusinessTypeName string
}
