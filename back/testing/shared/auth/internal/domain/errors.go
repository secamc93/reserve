package domain

import "errors"

var (
	// ErrInvalidCredentials indica credenciales inválidas
	ErrInvalidCredentials = errors.New("credenciales inválidas")

	// ErrEmptyCredentials indica que email o password están vacíos
	ErrEmptyCredentials = errors.New("email y password son requeridos")

	// ErrAPIConnection indica error de conexión con la API
	ErrAPIConnection = errors.New("error de conexión con la API")

	// ErrInvalidResponse indica respuesta inválida de la API
	ErrInvalidResponse = errors.New("respuesta inválida de la API")

	// ErrUnauthorized indica que no tiene autorización
	ErrUnauthorized = errors.New("no autorizado")

	// ErrBusinessTokenFailed indica error al obtener business token
	ErrBusinessTokenFailed = errors.New("error obteniendo business token")
)
