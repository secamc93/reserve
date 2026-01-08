package domain

import "errors"

var (
	ErrPackageNotFound         = errors.New("paquete no encontrado")
	ErrInvalidStatusTransition = errors.New("transición de estado inválida")
	ErrPackageAlreadyDelivered = errors.New("paquete ya entregado")
	ErrPackageNotDeliverable   = errors.New("paquete no puede ser entregado en su estado actual")
	ErrPropertyUnitNotFound    = errors.New("unidad de propiedad no encontrada")
	ErrResidentNotFound        = errors.New("residente no encontrado")
	ErrPackageAlreadyFinal     = errors.New("el paquete ya esta en un estado final")
)
