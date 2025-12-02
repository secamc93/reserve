package domain

import "errors"

var (
	// Errores de autenticación
	ErrInvalidCredentials    = errors.New("credenciales inválidas")
	ErrEmailPasswordRequired = errors.New("email y contraseña son requeridos")
	ErrUserInactive          = errors.New("usuario inactivo")
)
