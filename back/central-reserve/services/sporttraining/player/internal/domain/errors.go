package domain

import "errors"

var (
	ErrPlayerNotFound       = errors.New("jugador no encontrado")
	ErrPlayerAlreadyExists  = errors.New("ya existe un jugador con ese documento en este negocio")
	ErrInvalidDateOfBirth   = errors.New("fecha de nacimiento inválida")
	ErrMinorRequiresGuardian = errors.New("jugador menor de edad requiere un tutor")
)
