package usecasehorizontalproperty

import (
	"context"
	"fmt"
	"strings"

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

	// Procesar URLs de imágenes para cada elemento de la lista
	uc.processImageURLsForList(result.Data)

	uc.logger.Info().Int("count", len(result.Data)).Int64("total", result.Total).Msg("Lista de propiedades horizontales obtenida exitosamente")

	return result, nil
}

// processImageURLsForList procesa las URLs de imágenes para una lista de propiedades
func (uc *HorizontalPropertyUseCase) processImageURLsForList(properties []domain.HorizontalPropertyListDTO) {
	baseURL := strings.TrimRight(uc.env.Get("URL_BASE_DOMAIN_S3"), "/")
	if baseURL == "" {
		return
	}

	for i := range properties {
		// Procesar LogoURL si es path relativo
		if properties[i].LogoURL != "" && !strings.HasPrefix(properties[i].LogoURL, "http") {
			properties[i].LogoURL = fmt.Sprintf("%s/%s", baseURL, strings.TrimLeft(properties[i].LogoURL, "/"))
		}

		// Procesar NavbarImageURL si es path relativo
		if properties[i].NavbarImageURL != "" && !strings.HasPrefix(properties[i].NavbarImageURL, "http") {
			properties[i].NavbarImageURL = fmt.Sprintf("%s/%s", baseURL, strings.TrimLeft(properties[i].NavbarImageURL, "/"))
		}
	}
}
