package domain

import "errors"

var (
	// Errores de roles
	ErrRoleNotFound   = errors.New("rol no encontrado")
	ErrRoleNameExists = errors.New("ya existe un rol con este nombre")
)
