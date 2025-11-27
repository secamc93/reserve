package domain

import "errors"

var (
	ErrPropertyUnitNotFound       = errors.New("unidad de propiedad no encontrada")
	ErrPropertyUnitNumberExists   = errors.New("ya existe una unidad con este número en la propiedad")
	ErrPropertyUnitNumberRequired = errors.New("el número de unidad es requerido")
	ErrPropertyUnitHasResidents   = errors.New("no se puede eliminar una unidad que tiene residentes registrados")
	ErrPropertyUnitRequired       = errors.New("la unidad de propiedad es requerida")
)
