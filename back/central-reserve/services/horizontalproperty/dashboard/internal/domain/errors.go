package domain

import "errors"

// ErrBusinessRequired: el resumen de hoy es de una propiedad concreta.
var ErrBusinessRequired = errors.New("se requiere la propiedad (business_id)")
