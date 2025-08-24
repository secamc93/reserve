package usecasebusiness

import (
	"central_reserve/internal/domain/dtos"
	"context"
	"fmt"
)

// GetBusinessResources obtiene todos los recursos permitidos y configurados de un negocio
func (uc *BusinessUseCase) GetBusinessResources(ctx context.Context, businessID uint) (*dtos.BusinessResourcesResponse, error) {
	uc.log.Info().Uint("business_id", businessID).Msg("Obteniendo recursos del negocio")

	// Obtener recursos del negocio usando el nuevo método del repositorio
	resources, err := uc.repository.GetBusinesResourcesConfigured(ctx, businessID)
	if err != nil {
		uc.log.Error().Err(err).Uint("business_id", businessID).Msg("Error al obtener recursos del negocio")
		return nil, fmt.Errorf("error al obtener recursos del negocio: %w", err)
	}

	// Convertir entidades a DTOs
	resourceDTOs := make([]dtos.BusinessResourceConfiguredResponse, len(resources))
	var activeCount, inactiveCount int

	for i, resource := range resources {
		resourceDTOs[i] = dtos.BusinessResourceConfiguredResponse{
			ResourceID:   resource.ResourceID,
			ResourceName: resource.ResourceName,
			IsActive:     resource.IsActive,
		}

		// Contar recursos activos e inactivos
		if resource.IsActive {
			activeCount++
		} else {
			inactiveCount++
		}
	}

	response := &dtos.BusinessResourcesResponse{
		BusinessID: businessID,
		Resources:  resourceDTOs,
		Total:      len(resources),
		Active:     activeCount,
		Inactive:   inactiveCount,
	}

	uc.log.Info().
		Uint("business_id", businessID).
		Int("total_resources", len(resources)).
		Int("active_resources", activeCount).
		Int("inactive_resources", inactiveCount).
		Msg("Recursos del negocio obtenidos exitosamente")

	return response, nil
}

// GetBusinessResourceStatus obtiene el estado de un recurso específico para un negocio
func (uc *BusinessUseCase) GetBusinessResourceStatus(ctx context.Context, businessID uint, resourceName string) (*dtos.BusinessResourceConfiguredResponse, error) {
	uc.log.Info().
		Uint("business_id", businessID).
		Str("resource_name", resourceName).
		Msg("Verificando estado de recurso del negocio")

	// Obtener todos los recursos del negocio
	resources, err := uc.repository.GetBusinesResourcesConfigured(ctx, businessID)
	if err != nil {
		uc.log.Error().Err(err).
			Uint("business_id", businessID).
			Str("resource_name", resourceName).
			Msg("Error al obtener recursos del negocio")
		return nil, fmt.Errorf("error al obtener recursos del negocio: %w", err)
	}

	// Buscar el recurso específico
	for _, resource := range resources {
		if resource.ResourceName == resourceName {
			response := &dtos.BusinessResourceConfiguredResponse{
				ResourceID:   resource.ResourceID,
				ResourceName: resource.ResourceName,
				IsActive:     resource.IsActive,
			}

			uc.log.Info().
				Uint("business_id", businessID).
				Str("resource_name", resourceName).
				Bool("is_active", resource.IsActive).
				Msg("Estado de recurso obtenido exitosamente")

			return response, nil
		}
	}

	// Recurso no encontrado
	uc.log.Warn().
		Uint("business_id", businessID).
		Str("resource_name", resourceName).
		Msg("Recurso no encontrado para el negocio")

	return nil, fmt.Errorf("recurso '%s' no encontrado para el negocio", resourceName)
}
