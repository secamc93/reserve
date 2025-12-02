package domain

import "time"

// Role representa la entidad de rol en el dominio
type Role struct {
	ID               uint
	Name             string
	Description      string
	Level            int
	IsSystem         bool
	ScopeID          uint
	ScopeName        string
	ScopeCode        string
	BusinessTypeID   uint
	BusinessTypeName string
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

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
