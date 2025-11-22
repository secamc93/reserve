package domain

import "errors"

// ═══════════════════════════════════════════════════════════════════
//
//	HORIZONTAL PROPERTY DOMAIN ERRORS - See horizontal_property_errors.go
//
// ═══════════════════════════════════════════════════════════════════

var (

	// Errores de Property Units
	ErrPropertyUnitNotFound       = errors.New("unidad de propiedad no encontrada")
	ErrPropertyUnitNumberExists   = errors.New("ya existe una unidad con este número en la propiedad")
	ErrPropertyUnitNumberRequired = errors.New("el número de unidad es requerido")
	ErrPropertyUnitHasResidents   = errors.New("no se puede eliminar una unidad que tiene residentes registrados")

	// Errores de Residents
	ErrResidentNotFound      = errors.New("residente no encontrado")
	ErrResidentEmailExists   = errors.New("ya existe un residente con este email en la propiedad")
	ErrResidentDniExists     = errors.New("ya existe un residente con este DNI en la propiedad")
	ErrResidentNameRequired  = errors.New("el nombre del residente es requerido")
	ErrResidentEmailRequired = errors.New("el email del residente es requerido")
	ErrResidentDniRequired   = errors.New("el DNI del residente es requerido")
	ErrPropertyUnitRequired  = errors.New("la unidad de propiedad es requerida")
	ErrResidentTypeRequired  = errors.New("el tipo de residente es requerido")
)
