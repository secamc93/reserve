package domain

import "errors"

var (
	ErrVisitorNotFound         = errors.New("visitante no encontrado")
	ErrVisitNotFound           = errors.New("visita no encontrada")
	ErrVisitNotAuthorized      = errors.New("visita no autorizada")
	ErrVisitExpired            = errors.New("visita expirada")
	ErrVisitorBlacklisted      = errors.New("visitante está en lista negra")
	ErrInvalidStatusTransition = errors.New("transición de estado inválida")
	ErrVisitAlreadyCompleted   = errors.New("visita ya completada")
	ErrVisitNotInProgress      = errors.New("visita no está en curso")
	ErrEntryNotRegistered      = errors.New("entrada no registrada")
	ErrAssetsPendingExit       = errors.New("hay activos pendientes de verificación de salida")
)
