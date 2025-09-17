package usecasebusinesstyperesource

import (
	"context"
	"math"

	"central_reserve/services/business/internal/domain"
)

// GetBusinessesWithConfiguredResourcesPaginated obtiene todos los business con sus recursos configurados con paginación
func (uc *businessTypeResourceUseCase) GetBusinessesWithConfiguredResourcesPaginated(ctx context.Context, page, perPage int, businessID *uint) (*domain.BusinessesWithConfiguredResourcesPaginatedResponse, error) {
	if businessID != nil {
		uc.log.Info().Int("page", page).Int("per_page", perPage).Uint("business_id", *businessID).Msg("Obteniendo business con recursos configurados (filtrado)")
	} else {
		uc.log.Info().Int("page", page).Int("per_page", perPage).Msg("Obteniendo business con recursos configurados paginados")
	}

	// Validar parámetros de paginación
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 10 // Valor por defecto
	}

	// Obtener datos del repositorio
	businesses, total, err := uc.businessRepository.GetBusinessesWithConfiguredResourcesPaginated(ctx, page, perPage, businessID)
	if err != nil {
		uc.log.Error().Err(err).Int("page", page).Int("per_page", perPage).Msg("Error al obtener business con recursos configurados")
		return nil, err
	}

	// Calcular información de paginación
	lastPage := int(math.Ceil(float64(total) / float64(perPage)))
	hasNext := page < lastPage
	hasPrev := page > 1

	pagination := domain.PaginationResponse{
		CurrentPage: page,
		PerPage:     perPage,
		Total:       total,
		LastPage:    lastPage,
		HasNext:     hasNext,
		HasPrev:     hasPrev,
	}

	response := &domain.BusinessesWithConfiguredResourcesPaginatedResponse{
		Businesses: businesses,
		Pagination: pagination,
	}

	uc.log.Info().Int("page", page).Int("per_page", perPage).Int64("total", total).Int("returned", len(businesses)).Msg("Business con recursos configurados obtenidos exitosamente")

	return response, nil
}
