package usecasehorizontalproperty

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/internal/domain"
)

// ListHorizontalProperties obtiene una lista paginada de propiedades horizontales
func (uc *HorizontalPropertyUseCase) ListHorizontalProperties(ctx context.Context, filters domain.HorizontalPropertyFiltersDTO) (*domain.PaginatedHorizontalPropertyDTO, error) {
	uc.logger.Info().Interface("filters", filters).Msg("Obteniendo lista de propiedades horizontales")

	// Establecer valores por defecto para paginación
	if filters.Page <= 0 {
		filters.Page = 1
	}
	if filters.PageSize <= 0 {
		filters.PageSize = 10
	}
	if filters.PageSize > 100 {
		filters.PageSize = 100
	}
	if filters.OrderBy == "" {
		filters.OrderBy = "created_at"
	}
	if filters.OrderDir == "" {
		filters.OrderDir = "desc"
	}

	// Obtener lista paginada del repositorio
	result, err := uc.repo.ListHorizontalProperties(ctx, filters)
	if err != nil {
		uc.logger.Error().Err(err).Interface("filters", filters).Msg("Error obteniendo lista de propiedades horizontales")
		return nil, fmt.Errorf("error obteniendo lista de propiedades horizontales: %w", err)
	}

	uc.logger.Info().Int("count", len(result.Data)).Int64("total", result.Total).Msg("Lista de propiedades horizontales obtenida exitosamente")

	return result, nil
}
