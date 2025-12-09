package app

import (
	"central_reserve/services/auth/roles/internal/domain"
	"context"
	"math"
)

// GetRoles obtiene todos los roles con filtros y paginación
func (uc *RoleUseCase) GetRoles(ctx context.Context, filters domain.RoleFilters) (*domain.RoleListDTO, error) {
	uc.log.Info().
		Int("page", filters.Page).
		Int("page_size", filters.PageSize).
		Str("sort_by", filters.SortBy).
		Str("sort_order", filters.SortOrder).
		Msg("Iniciando caso de uso: obtener roles filtrados y paginados")

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
			"id": true, "name": true, "level": true, "created_at": true, "updated_at": true,
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

	roles, total, err := uc.repository.GetRoles(ctx, filters)
	if err != nil {
		uc.log.Error().Err(err).Msg("Error al obtener roles desde el repositorio")
		return nil, err
	}

	// Convertir entidades a DTOs
	roleDTOs := make([]domain.RoleDTO, len(roles))
	for i, role := range roles {
		roleDTOs[i] = entityToRoleDTO(role)
	}

	// Calcular total de páginas
	totalPages := int(math.Ceil(float64(total) / float64(filters.PageSize)))

	uc.log.Info().
		Int("count", len(roleDTOs)).
		Int64("total", total).
		Int("current_page", filters.Page).
		Int("per_page", filters.PageSize).
		Int("total_pages", totalPages).
		Msg("Roles obtenidos exitosamente con paginación")

	return &domain.RoleListDTO{
		Roles:      roleDTOs,
		Total:      total,
		Page:       filters.Page,
		PageSize:   filters.PageSize,
		TotalPages: totalPages,
	}, nil
}

// entityToRoleDTO convierte una entidad Role a RoleDTO
func entityToRoleDTO(role domain.Role) domain.RoleDTO {
	return domain.RoleDTO{
		ID:               role.ID,
		Name:             role.Name,
		Description:      role.Description,
		Level:            role.Level,
		IsSystem:         role.IsSystem,
		ScopeID:          role.ScopeID,
		ScopeName:        role.ScopeName,
		ScopeCode:        role.ScopeCode,
		BusinessTypeID:   role.BusinessTypeID,
		BusinessTypeName: role.BusinessTypeName,
	}
}
