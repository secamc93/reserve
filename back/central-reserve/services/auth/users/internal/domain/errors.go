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

	// Super admin (rol de alcance platform, sin propiedad)
	ErrPlatformRoleNotFound      = errors.New("no existe un rol de alcance platform")
	ErrCannotRevokeOwnSuperAdmin = errors.New("no puedes quitarte a ti mismo el rol de super admin")
)
