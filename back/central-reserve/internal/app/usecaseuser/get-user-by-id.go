package usecaseuser

import (
	"central_reserve/internal/domain/dtos"
	"context"
	"fmt"
)

// GetUserByID obtiene un usuario por su ID
func (uc *UserUseCase) GetUserByID(ctx context.Context, id uint) (*dtos.UserDTO, error) {
	uc.log.Info().Uint("id", id).Msg("Iniciando caso de uso: obtener usuario por ID")

	user, err := uc.repository.GetUserByID(ctx, id)
	if err != nil {
		uc.log.Error().Uint("id", id).Err(err).Msg("Error al obtener usuario por ID desde el repositorio")
		return nil, fmt.Errorf("usuario no encontrado")
	}

	if user == nil {
		uc.log.Error().Uint("id", id).Msg("Usuario no encontrado")
		return nil, fmt.Errorf("usuario no encontrado")
	}

	// Convertir entidad a DTO
	userDTO := dtos.UserDTO{
		ID:          user.ID,
		Name:        user.Name,
		Email:       user.Email,
		Phone:       user.Phone,
		AvatarURL:   user.AvatarURL,
		IsActive:    user.IsActive,
		LastLoginAt: user.LastLoginAt,
		CreatedAt:   user.CreatedAt,
		UpdatedAt:   user.UpdatedAt,
		DeletedAt:   user.DeletedAt,
	}

	// Obtener roles del usuario
	roles, err := uc.repository.GetUserRoles(ctx, user.ID)
	if err != nil {
		uc.log.Error().Uint("user_id", user.ID).Err(err).Msg("Error al obtener roles del usuario")
	} else {
		// Convertir roles a DTOs
		userDTO.Roles = make([]dtos.RoleDTO, len(roles))
		for i, role := range roles {
			userDTO.Roles[i] = dtos.RoleDTO{
				ID:          role.ID,
				Name:        role.Name,
				Code:        role.Code,
				Description: role.Description,
				Level:       role.Level,
				IsSystem:    role.IsSystem,
				ScopeID:     role.ScopeID,
				ScopeName:   role.ScopeName,
				ScopeCode:   role.ScopeCode,
			}
		}
	}

	// Obtener businesses del usuario
	businesses, err := uc.repository.GetUserBusinesses(ctx, user.ID)
	if err != nil {
		uc.log.Error().Uint("user_id", user.ID).Err(err).Msg("Error al obtener businesses del usuario")
	} else {
		// Convertir businesses a DTOs
		userDTO.Businesses = make([]dtos.BusinessDTO, len(businesses))
		for i, business := range businesses {
			userDTO.Businesses[i] = dtos.BusinessDTO{
				ID:                 business.ID,
				Name:               business.Name,
				Code:               business.Code,
				BusinessTypeID:     business.BusinessTypeID,
				Timezone:           business.Timezone,
				Address:            business.Address,
				Description:        business.Description,
				LogoURL:            business.LogoURL,
				PrimaryColor:       business.PrimaryColor,
				SecondaryColor:     business.SecondaryColor,
				CustomDomain:       business.CustomDomain,
				IsActive:           business.IsActive,
				EnableDelivery:     business.EnableDelivery,
				EnablePickup:       business.EnablePickup,
				EnableReservations: business.EnableReservations,
				BusinessTypeName:   business.BusinessTypeName,
				BusinessTypeCode:   business.BusinessTypeCode,
			}
		}
	}

	uc.log.Info().Uint("id", id).Msg("Usuario obtenido exitosamente")
	return &userDTO, nil
}
