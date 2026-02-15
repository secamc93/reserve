package domain

import "errors"

var (
	ErrSessionNotFound          = errors.New("sesión no encontrada")
	ErrSessionAlreadyCancelled  = errors.New("la sesión ya está cancelada")
	ErrInvalidSessionDates      = errors.New("fechas de sesión inválidas")
	ErrInvalidSessionMode       = errors.New("modo de sesión inválido")
	ErrSessionTypeRequired      = errors.New("tipo de sesión requerido")
	ErrCoachRequired            = errors.New("entrenador requerido")
)
