package domain

import "errors"

// ═══════════════════════════════════════════════════════════════════
//
//	HORIZONTAL PROPERTY DOMAIN ERRORS
//
// ═══════════════════════════════════════════════════════════════════

var (
	// Errores de validación
	ErrHorizontalPropertyNameRequired    = errors.New("el nombre de la propiedad horizontal es requerido")
	ErrHorizontalPropertyCodeRequired    = errors.New("el código de la propiedad horizontal es requerido")
	ErrHorizontalPropertyCodeInvalid     = errors.New("el código de la propiedad horizontal debe ser alfanumérico")
	ErrHorizontalPropertyAddressRequired = errors.New("la dirección de la propiedad horizontal es requerida")
	ErrHorizontalPropertyUnitsRequired   = errors.New("el número de unidades es requerido y debe ser mayor a 0")

	// Errores de negocio
	ErrHorizontalPropertyNotFound     = errors.New("propiedad horizontal no encontrada")
	ErrHorizontalPropertyCodeExists   = errors.New("ya existe una propiedad horizontal con este código")
	ErrCustomDomainExists             = errors.New("el dominio personalizado ya está en uso")
	ErrHorizontalPropertyHasUnits     = errors.New("no se puede eliminar una propiedad horizontal que tiene unidades registradas")
	ErrHorizontalPropertyHasResidents = errors.New("no se puede eliminar una propiedad horizontal que tiene residentes registrados")
	ErrParentBusinessNotFound         = errors.New("el negocio padre especificado no existe")
	ErrInvalidParentBusiness          = errors.New("el ID del negocio padre no es válido")

	// Errores de tipo de negocio
	ErrBusinessTypeNotFound              = errors.New("tipo de negocio no encontrado")
	ErrBusinessTypeNotHorizontalProperty = errors.New("el tipo de negocio debe ser de propiedad horizontal")

	// Errores de autorización
	ErrUnauthorized            = errors.New("no autorizado")
	ErrInsufficientPermissions = errors.New("permisos insuficientes")

	// Errores de sistema
	ErrInternalServer     = errors.New("error interno del servidor")
	ErrDatabaseConnection = errors.New("error de conexión a la base de datos")

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
