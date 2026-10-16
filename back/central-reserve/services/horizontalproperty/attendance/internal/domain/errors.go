package domain

import "errors"

var (
	// ErrAttendanceRecordNotFound: el registro no existe o es de otra propiedad (no se revela cuál).
	ErrAttendanceRecordNotFound = errors.New("registro de asistencia no encontrado")
	ErrProxyNameRequired        = errors.New("el nombre del apoderado es obligatorio")
)
