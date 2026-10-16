package domain

import "errors"

var (
	// ErrAttendanceRecordNotFound: el registro no existe o es de otra propiedad (no se revela cuál).
	ErrAttendanceRecordNotFound = errors.New("registro de asistencia no encontrado")
	// ErrAttendanceListNotFound: la lista no existe o es de otra propiedad (no se revela cuál).
	ErrAttendanceListNotFound   = errors.New("lista de asistencia no encontrada")
	ErrProxyNameRequired        = errors.New("el nombre del apoderado es obligatorio")
)
