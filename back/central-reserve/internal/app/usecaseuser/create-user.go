package usecaseuser

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/domain/entities"
	"context"
	"fmt"
)

// CreateUser crea un nuevo usuario
func (uc *UserUseCase) CreateUser(ctx context.Context, userDTO dtos.CreateUserDTO) (string, error) {
	uc.log.Info().Str("email", userDTO.Email).Msg("Iniciando caso de uso: crear usuario")

	// Validar que el email no exista
	existingUser, err := uc.repository.GetUserByEmail(ctx, userDTO.Email)
	if err == nil && existingUser != nil {
		uc.log.Error().Str("email", userDTO.Email).Msg("Email ya existe")
		return "", fmt.Errorf("el email ya está registrado")
	}

	// Convertir DTO a entidad
	user := entities.User{
		Name:      userDTO.Name,
		Email:     userDTO.Email,
		Password:  userDTO.Password,
		Phone:     userDTO.Phone,
		AvatarURL: userDTO.AvatarURL,
		IsActive:  userDTO.IsActive,
	}

	// Crear usuario
	message, err := uc.repository.CreateUser(ctx, user)
	if err != nil {
		uc.log.Error().Err(err).Msg("Error al crear usuario desde el repositorio")
		return "", err
	}

	// Asignar roles si se proporcionan
	if len(userDTO.RoleIDs) > 0 {
		if err := uc.repository.AssignRolesToUser(ctx, user.ID, userDTO.RoleIDs); err != nil {
			uc.log.Error().Err(err).Msg("Error al asignar roles al usuario")
			// No fallar la creación del usuario si falla la asignación de roles
		}
	}

	// Asignar businesses si se proporcionan
	if len(userDTO.BusinessIDs) > 0 {
		if err := uc.repository.AssignBusinessesToUser(ctx, user.ID, userDTO.BusinessIDs); err != nil {
			uc.log.Error().Err(err).Msg("Error al asignar businesses al usuario")
			// No fallar la creación del usuario si falla la asignación de businesses
		}
	}

	uc.log.Info().Uint("user_id", user.ID).Msg("Usuario creado exitosamente")
	return message, nil
}
