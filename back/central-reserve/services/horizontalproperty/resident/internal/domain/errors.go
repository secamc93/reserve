package domain

import "errors"

var (
	ErrResidentNotFound      = errors.New("residente no encontrado")
	ErrResidentEmailExists   = errors.New("ya existe un residente con este email en la propiedad")
	ErrResidentDniExists     = errors.New("ya existe un residente con este DNI en la propiedad")
	ErrResidentNameRequired  = errors.New("el nombre del residente es requerido")
	ErrResidentEmailRequired = errors.New("el email del residente es requerido")
	ErrResidentDniRequired   = errors.New("el DNI del residente es requerido")
	ErrPropertyUnitRequired  = errors.New("la unidad de propiedad es requerida")
	ErrResidentTypeRequired  = errors.New("el tipo de residente es requerido")
)
