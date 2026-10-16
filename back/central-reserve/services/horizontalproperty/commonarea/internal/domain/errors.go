package domain

import "errors"

var (
	ErrCommonAreaNotFound      = errors.New("zona común no encontrada")
	ErrReservationNotFound     = errors.New("reserva no encontrada")
	ErrReservationNotAvailable = errors.New("zona no disponible en el horario solicitado")
	ErrReservationOverlap      = errors.New("ya existe una reserva en ese horario")
	ErrInvalidTimeRange        = errors.New("rango de tiempo inválido")
	ErrExceedsCapacity         = errors.New("número de invitados excede la capacidad máxima")
	ErrInvalidStatusTransition = errors.New("transición de estado inválida")
	ErrReservationExpired      = errors.New("reserva expirada")
	ErrReservationCancelled    = errors.New("reserva cancelada")
	ErrScheduleNotConfigured   = errors.New("no hay horario configurado para este día")
	ErrRestrictionActive       = errors.New("zona bloqueada por restricción temporal")
	ErrCommonAreaInactive      = errors.New("la zona común no está activa")
	ErrOutsideSchedule         = errors.New("el horario solicitado está fuera del horario disponible")
	ErrRestrictionNotFound     = errors.New("restricción no encontrada")
	ErrInvalidSchedule         = errors.New("horario inválido")
	ErrInvalidRestriction      = errors.New("restricción inválida")
)
