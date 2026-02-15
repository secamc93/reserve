package domain

import "errors"

var (
	// ErrVisitorNotFound indica que el visitante no fue encontrado
	ErrVisitorNotFound = errors.New("visitante no encontrado")

	// ErrVisitNotFound indica que la visita no fue encontrada
	ErrVisitNotFound = errors.New("visita no encontrada")

	// ErrCompanionNotFound indica que el acompañante no fue encontrado
	ErrCompanionNotFound = errors.New("acompañante no encontrado")

	// ErrInvalidDNI indica que el DNI proporcionado es inválido
	ErrInvalidDNI = errors.New("DNI inválido")

	// ErrInvalidVisitorData indica que los datos del visitante son inválidos
	ErrInvalidVisitorData = errors.New("datos del visitante inválidos")

	// ErrInvalidVisitData indica que los datos de la visita son inválidos
	ErrInvalidVisitData = errors.New("datos de la visita inválidos")

	// ErrAuthenticationFailed indica que la autenticación falló
	ErrAuthenticationFailed = errors.New("autenticación fallida")

	// ErrUnauthorized indica que el usuario no tiene permisos
	ErrUnauthorized = errors.New("no autorizado")

	// ErrBusinessNotFound indica que el negocio no fue encontrado
	ErrBusinessNotFound = errors.New("negocio no encontrado")

	// ErrAPIConnection indica error de conexión con la API
	ErrAPIConnection = errors.New("error de conexión con la API")

	// ErrInvalidResponse indica que la respuesta de la API es inválida
	ErrInvalidResponse = errors.New("respuesta de API inválida")
)
