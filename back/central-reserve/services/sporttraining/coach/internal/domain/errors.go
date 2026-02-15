package domain

import "errors"

var (
	ErrCoachNotFound            = errors.New("entrenador no encontrado")
	ErrCoachAlreadyExists       = errors.New("ya existe un entrenador con ese documento en este negocio")
	ErrSpecialtyAlreadyAssigned = errors.New("esta especialidad ya está asignada al entrenador")
	ErrInvalidProficiencyLevel  = errors.New("nivel de competencia inválido (debe ser entre 1 y 5)")
)
