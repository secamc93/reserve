package domain

import "errors"

var (
	ErrGuardianNotFound        = errors.New("tutor no encontrado")
	ErrGuardianAlreadyAssigned = errors.New("el tutor ya está asignado a este jugador")
	ErrPlayerNotFound          = errors.New("jugador no encontrado")
)
