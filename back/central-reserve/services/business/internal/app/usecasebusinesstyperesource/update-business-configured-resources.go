package usecasebusinesstyperesource

import (
	"context"
	"errors"

	"central_reserve/services/business/internal/domain"
)

// UpdateBusinessConfiguredResources actualiza los recursos configurados para un business específico
func (uc *businessTypeResourceUseCase) UpdateBusinessConfiguredResources(ctx context.Context, businessID uint, request domain.UpdateBusinessTypeResourcesRequest) error {
	uc.log.Info().Uint("business_id", businessID).Int("resources_count", len(request.ResourcesIDs)).Msg("Actualizando recursos configurados del business")

	// Validar que no hay IDs duplicados
	resourceMap := make(map[uint]bool)
	for _, resourceID := range request.ResourcesIDs {
		if resourceMap[resourceID] {
			uc.log.Error().Uint("resource_id", resourceID).Msg("ID de recurso duplicado encontrado")
			return errors.New("no se permiten IDs de recursos duplicados")
		}
		resourceMap[resourceID] = true
	}

	// Actualizar los recursos configurados
	err := uc.businessRepository.UpdateBusinessConfiguredResources(ctx, businessID, request.ResourcesIDs)
	if err != nil {
		uc.log.Error().Err(err).Uint("business_id", businessID).Msg("Error al actualizar recursos configurados del business")
		return err
	}

	uc.log.Info().Uint("business_id", businessID).Int("resources_count", len(request.ResourcesIDs)).Msg("Recursos configurados del business actualizados exitosamente")

	return nil
}
