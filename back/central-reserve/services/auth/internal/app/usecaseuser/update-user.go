package usecaseuser

import (
	"central_reserve/services/auth/internal/domain"
	"context"
	"fmt"
	"strings"
)

// UpdateUser actualiza un usuario existente
func (uc *UserUseCase) UpdateUser(ctx context.Context, id uint, userDTO domain.UpdateUserDTO) (string, error) {
	uc.log.Info().Uint("id", id).Msg("Iniciando caso de uso: actualizar usuario")

	// Verificar que el usuario existe
	existingUser, err := uc.repository.GetUserByID(ctx, id)
	if err != nil || existingUser == nil {
		uc.log.Error().Uint("id", id).Msg("Usuario no encontrado")
		return "", fmt.Errorf("usuario no encontrado")
	}

	// Verificar que el email no esté en uso por otro usuario
	if userDTO.Email != existingUser.Email {
		userWithEmail, err := uc.repository.GetUserByEmail(ctx, userDTO.Email)
		if err == nil && userWithEmail != nil && userWithEmail.ID != id {
			uc.log.Error().Str("email", userDTO.Email).Msg("Email ya existe en otro usuario")
			return "", fmt.Errorf("el email ya está registrado por otro usuario")
		}
	}

	// Procesar imagen de avatar si se proporciona una nueva
	avatarURL := userDTO.AvatarURL
	if userDTO.AvatarFile != nil {
		uc.log.Info().Uint("user_id", id).Msg("Subiendo nueva imagen de avatar a S3")

		// Subir nueva imagen a S3 en la carpeta "avatars"
		// Retorna el path relativo (ej: "avatars/1234567890_imagen.jpg")
		avatarPath, err := uc.s3.UploadImage(ctx, userDTO.AvatarFile, "avatars")
		if err != nil {
			uc.log.Error().Err(err).Uint("user_id", id).Msg("Error al subir nueva imagen de avatar")
			return "", fmt.Errorf("error al subir nueva imagen de avatar: %w", err)
		}

		// Guardar solo el path relativo en la base de datos
		avatarURL = avatarPath
		uc.log.Info().Uint("user_id", id).Str("avatar_path", avatarPath).Msg("Nueva imagen de avatar subida exitosamente")

		// Eliminar imagen anterior si existe y es diferente
		if existingUser.AvatarURL != "" && existingUser.AvatarURL != avatarPath {
			// Verificar si la imagen anterior es un path relativo (no URL completa)
			if !strings.HasPrefix(existingUser.AvatarURL, "http") {
				uc.log.Info().Uint("user_id", id).Str("old_avatar", existingUser.AvatarURL).Msg("Eliminando imagen anterior de avatar")
				if err := uc.s3.DeleteImage(ctx, existingUser.AvatarURL); err != nil {
					uc.log.Warn().Err(err).Str("old_avatar", existingUser.AvatarURL).Msg("Error al eliminar imagen anterior (no crítico)")
					// No fallar la actualización si no se puede eliminar la imagen anterior
				}
			}
		}
	} else if userDTO.AvatarURL == "" && existingUser.AvatarURL != "" {
		// Si se quiere eliminar la imagen (AvatarURL vacío) y existe una imagen anterior
		uc.log.Info().Uint("user_id", id).Str("old_avatar", existingUser.AvatarURL).Msg("Eliminando imagen de avatar")

		// Verificar si la imagen anterior es un path relativo (no URL completa)
		if !strings.HasPrefix(existingUser.AvatarURL, "http") {
			if err := uc.s3.DeleteImage(ctx, existingUser.AvatarURL); err != nil {
				uc.log.Warn().Err(err).Str("old_avatar", existingUser.AvatarURL).Msg("Error al eliminar imagen anterior (no crítico)")
				// No fallar la actualización si no se puede eliminar la imagen
			}
		}
		avatarURL = "" // Limpiar la URL
	}

	// Convertir DTO a entidad
	user := domain.UsersEntity{
		Name:      userDTO.Name,
		Email:     userDTO.Email,
		Phone:     userDTO.Phone,
		AvatarURL: avatarURL, // URL relativa o vacía según corresponda
		IsActive:  userDTO.IsActive,
	}

	// Solo actualizar contraseña si se proporciona una nueva
	if userDTO.Password != "" {
		user.Password = userDTO.Password
	}

	// Actualizar usuario
	message, err := uc.repository.UpdateUser(ctx, id, user)
	if err != nil {
		uc.log.Error().Uint("id", id).Err(err).Msg("Error al actualizar usuario desde el repositorio")
		return "", err
	}

	// Asignar roles si se proporcionan
	if len(userDTO.RoleIDs) > 0 {
		if err := uc.repository.AssignRolesToUser(ctx, id, userDTO.RoleIDs); err != nil {
			uc.log.Error().Err(err).Msg("Error al asignar roles al usuario")
			// No fallar la actualización del usuario si falla la asignación de roles
		}
	}

	// Asignar businesses si se proporcionan
	if len(userDTO.BusinessIDs) > 0 {
		if err := uc.repository.AssignBusinessesToUser(ctx, id, userDTO.BusinessIDs); err != nil {
			uc.log.Error().Err(err).Msg("Error al asignar businesses al usuario")
			// No fallar la actualización del usuario si falla la asignación de businesses
		}
	}

	uc.log.Info().Uint("user_id", id).Msg("Usuario actualizado exitosamente")
	return message, nil
}
