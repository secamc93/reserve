package usecaseuser

import (
	"central_reserve/internal/domain/dtos"
	"context"
	"fmt"
	"strings"
)

// GetUsers obtiene usuarios filtrados y paginados
func (uc *UserUseCase) GetUsers(ctx context.Context, filters dtos.UserFilters) (*dtos.UserListDTO, error) {
	uc.log.Info().
		Int("page", filters.Page).
		Int("page_size", filters.PageSize).
		Str("name", filters.Name).
		Str("email", filters.Email).
		Str("phone", filters.Phone).
		Str("sort_by", filters.SortBy).
		Str("sort_order", filters.SortOrder).
		Msg("Iniciando caso de uso: obtener usuarios filtrados y paginados")

	// Validar y normalizar parámetros de paginación
	if filters.Page < 1 {
		filters.Page = 1
	}
	if filters.PageSize < 1 {
		filters.PageSize = 10
	}
	if filters.PageSize > 100 {
		filters.PageSize = 100
	}

	// Validar ordenamiento
	if filters.SortBy != "" {
		allowedSortFields := map[string]bool{
			"name": true, "email": true, "phone": true, "is_active": true,
			"created_at": true, "updated_at": true,
		}
		if !allowedSortFields[filters.SortBy] {
			filters.SortBy = "created_at"
		}
	}

	if filters.SortOrder != "" {
		if filters.SortOrder != "asc" && filters.SortOrder != "desc" {
			filters.SortOrder = "desc"
		}
	}

	users, total, err := uc.repository.GetUsers(ctx, filters)
	if err != nil {
		uc.log.Error().Err(err).Msg("Error al obtener usuarios desde el repositorio")
		return nil, err
	}

	// Convertir UserQueryDTO a UserDTO y obtener relaciones
	userDTOs := make([]dtos.UserDTO, len(users))
	for i, user := range users {
		// Procesar URL del avatar
		avatarURL := user.AvatarURL
		if avatarURL != "" {
			// Verificar si es un path relativo (no empieza con http)
			if !strings.HasPrefix(avatarURL, "http") {
				// Verificar si la imagen existe en S3
				exists, err := uc.s3.ImageExists(ctx, avatarURL)
				if err != nil {
					uc.log.Error().Err(err).Str("avatar_path", avatarURL).Msg("Error al verificar existencia de imagen en S3")
					// No fallar si hay error al verificar, continuar con URL por defecto
				} else if exists {
					// Generar URL completa usando el dominio de media
					mediaBaseURL := uc.getMediaBaseURL()
					if mediaBaseURL != "" {
						// Construir URL completa: MEDIA_BASE_URL + / + avatar_path
						avatarURL = fmt.Sprintf("%s/%s", mediaBaseURL, strings.TrimLeft(avatarURL, "/"))
						uc.log.Debug().Str("avatar_path", user.AvatarURL).Str("full_url", avatarURL).Msg("URL de avatar generada (media)")
					} else {
						uc.log.Warn().Str("avatar_path", avatarURL).Msg("URL_BASE_DOMAIN_S3 no configurada, usando path relativo")
					}
				} else {
					uc.log.Warn().Str("avatar_path", avatarURL).Msg("Imagen de avatar no encontrada en S3")
					// Si la imagen no existe, limpiar la URL
					avatarURL = ""
				}
			}
			// Si ya es una URL completa (empieza con http), mantenerla tal como está
		}

		// Convertir datos básicos
		userDTOs[i] = dtos.UserDTO{
			ID:          user.ID,
			Name:        user.Name,
			Email:       user.Email,
			Phone:       user.Phone,
			AvatarURL:   avatarURL, // URL completa o vacía
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
			userDTOs[i].Roles = make([]dtos.RoleDTO, len(roles))
			for j, role := range roles {
				userDTOs[i].Roles[j] = dtos.RoleDTO{
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
			userDTOs[i].Businesses = make([]dtos.BusinessDTO, len(businesses))
			for j, business := range businesses {
				userDTOs[i].Businesses[j] = dtos.BusinessDTO{
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
	}

	// Calcular total de páginas
	totalPages := int((total + int64(filters.PageSize) - 1) / int64(filters.PageSize))

	userListDTO := &dtos.UserListDTO{
		Users:      userDTOs,
		Total:      total,
		Page:       filters.Page,
		PageSize:   filters.PageSize,
		TotalPages: totalPages,
	}

	uc.log.Info().
		Int("count", len(userDTOs)).
		Int64("total", total).
		Int("total_pages", totalPages).
		Msg("Usuarios obtenidos exitosamente")
	return userListDTO, nil
}
