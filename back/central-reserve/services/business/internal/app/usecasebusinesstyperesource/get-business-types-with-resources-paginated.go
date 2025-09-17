package usecasebusinesstyperesource

import (
	"context"
	"math"

	"central_reserve/services/business/internal/domain"
)

// GetBusinessTypesWithResourcesPaginated obtiene todos los tipos de negocio con sus recursos asociados con paginación
func (uc *businessTypeResourceUseCase) GetBusinessTypesWithResourcesPaginated(ctx context.Context, page, perPage int, businessTypeID *uint) (*domain.BusinessTypesWithResourcesPaginatedResponse, error) {
	if businessTypeID != nil {
		uc.log.Info().Int("page", page).Int("per_page", perPage).Uint("business_type_id", *businessTypeID).Msg("Obteniendo tipos de negocio con recursos paginados (filtrado)")
	} else {
		uc.log.Info().Int("page", page).Int("per_page", perPage).Msg("Obteniendo tipos de negocio con recursos paginados")
	}

	// Validar parámetros de paginación
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 10 // Valor por defecto
	}

	// Obtener datos del repositorio
	businessTypes, total, err := uc.businessRepository.GetBusinessTypesWithResourcesPaginated(ctx, page, perPage, businessTypeID)
	if err != nil {
		uc.log.Error().Err(err).Int("page", page).Int("per_page", perPage).Msg("Error al obtener tipos de negocio con recursos")
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

	response := &domain.BusinessTypesWithResourcesPaginatedResponse{
		BusinessTypes: businessTypes,
		Pagination:    pagination,
	}

	uc.log.Info().Int("page", page).Int("per_page", perPage).Int64("total", total).Int("returned", len(businessTypes)).Msg("Tipos de negocio con recursos obtenidos exitosamente")

	return response, nil
}
