package usecasebusinesstyperesource

import (
	"context"
	"fmt"

	"central_reserve/services/business/internal/domain"
)

// UpdateBusinessTypeResources actualiza los recursos permitidos para un tipo de negocio
func (uc *businessTypeResourceUseCase) UpdateBusinessTypeResources(ctx context.Context, businessTypeID uint, request domain.UpdateBusinessTypeResourcesRequest) error {
	uc.log.Info().Uint("business_type_id", businessTypeID).Int("resources_count", len(request.ResourcesIDs)).Msg("Actualizando recursos del tipo de negocio")

	// Validar que no hay IDs duplicados
	resourceMap := make(map[uint]bool)
	for _, resourceID := range request.ResourcesIDs {
		if resourceMap[resourceID] {
			uc.log.Error().Uint("resource_id", resourceID).Msg("ID de recurso duplicado encontrado")
			return fmt.Errorf("no se permiten IDs de recursos duplicados")
		}
		resourceMap[resourceID] = true
	}

	// Verificar que el tipo de negocio existe
	businessType, err := uc.businessRepository.GetBusinessTypeByID(ctx, businessTypeID)
	if err != nil {
		uc.log.Error().Err(err).Uint("business_type_id", businessTypeID).Msg("Error al verificar tipo de negocio")
		return err
	}

	// Verificar que todos los recursos existen (si hay recursos para asociar)
	if len(request.ResourcesIDs) > 0 {
		for _, resourceID := range request.ResourcesIDs {
			_, err := uc.businessRepository.GetResourceByID(ctx, resourceID)
			if err != nil {
				uc.log.Error().Err(err).Uint("resource_id", resourceID).Msg("Error al verificar recurso")
				return err
			}
		}
	}

	// Actualizar los recursos permitidos
	err = uc.businessRepository.UpdateBusinessTypeResourcesPermitted(ctx, businessTypeID, request.ResourcesIDs)
	if err != nil {
		uc.log.Error().Err(err).Uint("business_type_id", businessTypeID).Msg("Error al actualizar recursos del tipo de negocio")
		return err
	}

	uc.log.Info().Uint("business_type_id", businessTypeID).Str("business_type_name", businessType.Name).Int("resources_count", len(request.ResourcesIDs)).Msg("Recursos del tipo de negocio actualizados exitosamente")

	return nil
}
