package usecaseuser

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/domain/entities"
	"context"
	"fmt"
)

// UpdateUser actualiza un usuario existente
func (uc *UserUseCase) UpdateUser(ctx context.Context, id uint, userDTO dtos.UpdateUserDTO) (string, error) {
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

	// Convertir DTO a entidad
	user := entities.User{
		Name:      userDTO.Name,
		Email:     userDTO.Email,
		Phone:     userDTO.Phone,
		AvatarURL: userDTO.AvatarURL,
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
