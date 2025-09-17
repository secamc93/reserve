package mappers

import (
	"time"

	"central_reserve/services/business/internal/domain"
	"central_reserve/services/business/internal/infra/primary/controllers/businesresourcehandler/response"
)

// ToBusinessTypeResourcesResponse convierte del dominio a la respuesta
func ToBusinessTypeResourcesResponse(domainResponse domain.BusinessTypeResourcesResponse) response.BusinessTypeResourcesResponse {
	resources := make([]response.BusinessTypeResourcePermittedResponse, len(domainResponse.Resources))

	for i, resource := range domainResponse.Resources {
		resources[i] = response.BusinessTypeResourcePermittedResponse{
			ID:           resource.ID,
			ResourceID:   resource.ResourceID,
			ResourceName: resource.ResourceName,
		}
	}

	return response.BusinessTypeResourcesResponse{
		BusinessTypeID: domainResponse.BusinessTypeID,
		Resources:      resources,
		Total:          domainResponse.Total,
		Active:         domainResponse.Active,
		Inactive:       domainResponse.Inactive,
	}
}

// ToBusinessTypeResourcesSuccessResponse convierte a respuesta exitosa para recursos
func ToBusinessTypeResourcesSuccessResponse(domainResponse domain.BusinessTypeResourcesResponse) response.BusinessTypeResourcesSuccessResponse {
	return response.BusinessTypeResourcesSuccessResponse{
		Success: true,
		Message: "Recursos obtenidos exitosamente",
		Data:    ToBusinessTypeResourcesResponse(domainResponse),
	}
}

// ToUpdateResourcesSuccessResponse crea respuesta exitosa para actualización de recursos
func ToUpdateResourcesSuccessResponse(businessTypeID uint, resourcesCount int) response.UpdateResourcesSuccessResponse {
	return response.UpdateResourcesSuccessResponse{
		Success: true,
		Message: "Recursos actualizados exitosamente",
		Data: response.UpdateResourcesDataResponse{
			BusinessTypeID: businessTypeID,
			ResourcesCount: resourcesCount,
			UpdatedAt:      time.Now().UTC().Format(time.RFC3339),
		},
	}
}

// ToBusinessTypesWithResourcesPaginatedSuccessResponse convierte a respuesta exitosa paginada
func ToBusinessTypesWithResourcesPaginatedSuccessResponse(domainResponse domain.BusinessTypesWithResourcesPaginatedResponse) response.BusinessTypesWithResourcesPaginatedSuccessResponse {
	// Convertir business types
	businessTypes := make([]response.BusinessTypeWithResourcesResponse, len(domainResponse.BusinessTypes))
	for i, bt := range domainResponse.BusinessTypes {
		businessTypes[i] = response.BusinessTypeWithResourcesResponse{
			ID:        bt.ID,
			Name:      bt.Name,
			Resources: ToBusinessTypeResourcePermittedResponseSlice(bt.Resources),
			CreatedAt: bt.CreatedAt.Format(time.RFC3339),
			UpdatedAt: bt.UpdatedAt.Format(time.RFC3339),
		}
	}

	// Convertir paginación
	pagination := response.PaginationResponse{
		CurrentPage: domainResponse.Pagination.CurrentPage,
		PerPage:     domainResponse.Pagination.PerPage,
		Total:       domainResponse.Pagination.Total,
		LastPage:    domainResponse.Pagination.LastPage,
		HasNext:     domainResponse.Pagination.HasNext,
		HasPrev:     domainResponse.Pagination.HasPrev,
	}

	return response.BusinessTypesWithResourcesPaginatedSuccessResponse{
		Success: true,
		Message: "Tipos de negocio con recursos obtenidos exitosamente",
		Data: response.BusinessTypesWithResourcesPaginatedResponse{
			BusinessTypes: businessTypes,
			Pagination:    pagination,
		},
	}
}

// ToBusinessTypeResourcePermittedResponseSlice convierte slice de recursos
func ToBusinessTypeResourcePermittedResponseSlice(resources []domain.BusinessTypeResourcePermittedResponse) []response.BusinessTypeResourcePermittedResponse {
	result := make([]response.BusinessTypeResourcePermittedResponse, len(resources))
	for i, resource := range resources {
		result[i] = response.BusinessTypeResourcePermittedResponse{
			ID:           resource.ID,
			ResourceID:   resource.ResourceID,
			ResourceName: resource.ResourceName,
		}
	}
	return result
}

// ToBusinessResourcesSuccessResponse convierte a respuesta exitosa para recursos configurados
func ToBusinessResourcesSuccessResponse(domainResponse domain.BusinessResourcesResponse) response.SuccessResponse {
	return response.SuccessResponse{
		Success: true,
		Message: "Recursos configurados obtenidos exitosamente",
		Data:    domainResponse,
	}
}

// ToUpdateBusinessConfiguredResourcesSuccessResponse crea respuesta exitosa para actualización de recursos configurados
func ToUpdateBusinessConfiguredResourcesSuccessResponse(businessID uint, resourcesCount int) response.SuccessResponse {
	return response.SuccessResponse{
		Success: true,
		Message: "Recursos configurados actualizados exitosamente",
		Data: map[string]interface{}{
			"business_id":     businessID,
			"resources_count": resourcesCount,
			"updated_at":      time.Now().UTC().Format(time.RFC3339),
		},
	}
}

// ToBusinessesWithConfiguredResourcesPaginatedSuccessResponse convierte a respuesta exitosa paginada para business con recursos configurados
func ToBusinessesWithConfiguredResourcesPaginatedSuccessResponse(domainResponse domain.BusinessesWithConfiguredResourcesPaginatedResponse) response.SuccessResponse {
	// Convertir business
	businesses := make([]map[string]interface{}, len(domainResponse.Businesses))
	for i, business := range domainResponse.Businesses {
		// Convertir recursos configurados
		resources := make([]map[string]interface{}, len(business.Resources))
		for j, resource := range business.Resources {
			resources[j] = map[string]interface{}{
				"id":            resource.ResourceID,
				"resource_name": resource.ResourceName,
				"is_active":     resource.IsActive,
			}
		}

		businesses[i] = map[string]interface{}{
			"id":         business.ID,
			"name":       business.Name,
			"code":       business.Code,
			"resources":  resources,
			"created_at": business.CreatedAt.Format(time.RFC3339),
			"updated_at": business.UpdatedAt.Format(time.RFC3339),
		}
	}

	// Convertir paginación
	pagination := map[string]interface{}{
		"current_page": domainResponse.Pagination.CurrentPage,
		"per_page":     domainResponse.Pagination.PerPage,
		"total":        domainResponse.Pagination.Total,
		"last_page":    domainResponse.Pagination.LastPage,
		"has_next":     domainResponse.Pagination.HasNext,
		"has_prev":     domainResponse.Pagination.HasPrev,
	}

	return response.SuccessResponse{
		Success: true,
		Message: "Business con recursos configurados obtenidos exitosamente",
		Data: map[string]interface{}{
			"businesses": businesses,
			"pagination": pagination,
		},
	}
}

// ToErrorResponse convierte error a respuesta estructurada
func ToErrorResponse(err error, message string) response.ErrorResponse {
	return response.ErrorResponse{
		Success: false,
		Message: message,
		Error:   err.Error(),
	}
}
