package domain

import "errors"

var (
	// Errores de validación de usuario
	ErrUserPasswordError = errors.New("error al generar o procesar la contraseña")

	// Errores de negocio de usuario
	ErrUserNotFound           = errors.New("usuario no encontrado")
	ErrUserEmailExists        = errors.New("el email ya está registrado")
	ErrBusinessesNotFound     = errors.New("algunos businesses no existen")
	ErrUserAvatarUploadFailed = errors.New("error al subir imagen de avatar")
)
