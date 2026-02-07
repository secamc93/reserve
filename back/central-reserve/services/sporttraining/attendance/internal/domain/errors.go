package domain

import "errors"

var (
	ErrAttendanceAlreadyRecorded = errors.New("ya existe un registro de asistencia para este jugador en esta sesión")
	ErrSessionNotFound           = errors.New("sesión de entrenamiento no encontrada")
	ErrPlayerNotFound            = errors.New("jugador no encontrado")
	ErrAttendanceNotFound        = errors.New("registro de asistencia no encontrado")
)
