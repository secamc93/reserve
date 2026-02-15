package domain

import "errors"

var (
	ErrBookingNotFound         = errors.New("reserva no encontrada")
	ErrBookingAlreadyApproved  = errors.New("la reserva ya está aprobada")
	ErrBookingAlreadyCancelled = errors.New("la reserva ya está cancelada")
	ErrBookingInFinalState     = errors.New("la reserva está en estado final y no se puede modificar")
	ErrSessionFull             = errors.New("la sesión está llena")
)
