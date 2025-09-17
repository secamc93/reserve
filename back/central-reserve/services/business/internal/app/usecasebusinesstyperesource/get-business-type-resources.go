package usecasebusinesstyperesource

import (
	"context"

	"central_reserve/services/business/internal/domain"
)

// GetBusinessTypeResources obtiene todos los recursos permitidos para un tipo de negocio
func (uc *businessTypeResourceUseCase) GetBusinessTypeResources(ctx context.Context, businessTypeID uint) (*domain.BusinessTypeResourcesResponse, error) {
	uc.log.Info().Uint("business_type_id", businessTypeID).Msg("Obteniendo recursos del tipo de negocio")

	// Verificar que el tipo de negocio existe
	_, err := uc.businessRepository.GetBusinessTypeByID(ctx, businessTypeID)
	if err != nil {
		uc.log.Error().Err(err).Uint("business_type_id", businessTypeID).Msg("Error al verificar tipo de negocio")
		return nil, err
	}

	// Obtener los recursos permitidos
	resources, err := uc.businessRepository.GetBusinessTypeResourcesPermitted(ctx, businessTypeID)
	if err != nil {
		uc.log.Error().Err(err).Uint("business_type_id", businessTypeID).Msg("Error al obtener recursos del tipo de negocio")
		return nil, err
	}

	// Construir respuesta
	resourcesResponse := make([]domain.BusinessTypeResourcePermittedResponse, len(resources))

	for i, resource := range resources {
		resourcesResponse[i] = domain.BusinessTypeResourcePermittedResponse{
			ID:           resource.ID,
			ResourceID:   resource.ResourceID,
			ResourceName: resource.ResourceName,
		}
	}

	response := &domain.BusinessTypeResourcesResponse{
		BusinessTypeID: businessTypeID,
		Resources:      resourcesResponse,
		Total:          len(resources),
		Active:         len(resources),
		Inactive:       0,
	}

	uc.log.Info().Uint("business_type_id", businessTypeID).Int("total_resources", len(resources)).Msg("Recursos del tipo de negocio obtenidos exitosamente")

	return response, nil
}
