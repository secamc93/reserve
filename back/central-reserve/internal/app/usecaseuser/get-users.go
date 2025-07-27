package usecaseuser

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/domain/ports"
	"central_reserve/internal/pkg/log"
	"context"
)

// UserUseCase implementa los casos de uso para usuarios
type UserUseCase struct {
	repository ports.IUserRepository
	log        log.ILogger
}

// NewUserUseCase crea una nueva instancia del caso de uso de usuarios
func NewUserUseCase(repository ports.IUserRepository, log log.ILogger) *UserUseCase {
	return &UserUseCase{
		repository: repository,
		log:        log,
	}
}

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
		// Convertir datos básicos
		userDTOs[i] = dtos.UserDTO{
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
