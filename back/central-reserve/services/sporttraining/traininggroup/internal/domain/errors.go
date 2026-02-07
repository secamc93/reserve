package domain

import "errors"

var (
	ErrGroupNotFound         = errors.New("grupo de entrenamiento no encontrado")
	ErrGroupFull             = errors.New("grupo de entrenamiento está lleno")
	ErrPlayerAlreadyInGroup  = errors.New("el jugador ya está inscrito en este grupo")
	ErrPlayerNotInGroup      = errors.New("el jugador no está inscrito en este grupo")
)
