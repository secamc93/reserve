package mappers

import (
	"central_reserve/services/auth/resources/internal/domain"
	"central_reserve/services/auth/resources/internal/infra/primary/handlers/request"
)

// CreateResourceRequestToDTO convierte request a DTO de dominio
func CreateResourceRequestToDTO(req request.CreateResourceRequest) domain.CreateResourceDTO {
	return domain.CreateResourceDTO{
		Name:           req.Name,
		Description:    req.Description,
		BusinessTypeID: req.BusinessTypeID,
	}
}

// UpdateResourceRequestToDTO convierte request de actualización a DTO
func UpdateResourceRequestToDTO(req request.UpdateResourceRequest) domain.UpdateResourceDTO {
	return domain.UpdateResourceDTO{
		Name:           req.Name,
		Description:    req.Description,
		BusinessTypeID: req.BusinessTypeID,
	}
}

// GetResourcesRequestToFilters convierte request de consulta a filtros de dominio
func GetResourcesRequestToFilters(req request.GetResourcesRequest, businessTypeID *uint) domain.ResourceFilters {
	return domain.ResourceFilters{
		Page:           req.Page,
		PageSize:       req.PageSize,
		Name:           req.Name,
		Description:    req.Description,
		BusinessTypeID: businessTypeID,
		SortBy:         req.SortBy,
		SortOrder:      req.SortOrder,
	}
}
