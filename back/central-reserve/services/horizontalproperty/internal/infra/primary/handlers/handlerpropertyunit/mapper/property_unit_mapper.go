package mapper

import (
	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerpropertyunit/request"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerpropertyunit/response"
)

func MapCreateRequestToDTO(req request.CreatePropertyUnitRequest, businessID uint) domain.CreatePropertyUnitDTO {
	return domain.CreatePropertyUnitDTO{
		BusinessID:  businessID,
		Number:      req.Number,
		Floor:       req.Floor,
		Block:       req.Block,
		UnitType:    req.UnitType,
		Area:        req.Area,
		Bedrooms:    req.Bedrooms,
		Bathrooms:   req.Bathrooms,
		Description: req.Description,
	}
}

func MapUpdateRequestToDTO(req request.UpdatePropertyUnitRequest) domain.UpdatePropertyUnitDTO {
	return domain.UpdatePropertyUnitDTO{
		Number:      req.Number,
		Floor:       req.Floor,
		Block:       req.Block,
		UnitType:    req.UnitType,
		Area:        req.Area,
		Bedrooms:    req.Bedrooms,
		Bathrooms:   req.Bathrooms,
		Description: req.Description,
		IsActive:    req.IsActive,
	}
}

func MapFiltersRequestToDTO(req request.PropertyUnitFiltersRequest, businessID uint) domain.PropertyUnitFiltersDTO {
	return domain.PropertyUnitFiltersDTO{
		BusinessID: businessID,
		Number:     req.Number,
		UnitType:   req.UnitType,
		Floor:      req.Floor,
		Block:      req.Block,
		IsActive:   req.IsActive,
		Page:       req.Page,
		PageSize:   req.PageSize,
	}
}

func MapDetailDTOToResponse(dto *domain.PropertyUnitDetailDTO) response.PropertyUnitResponse {
	return response.PropertyUnitResponse{
		ID:          dto.ID,
		BusinessID:  dto.BusinessID,
		Number:      dto.Number,
		Floor:       dto.Floor,
		Block:       dto.Block,
		UnitType:    dto.UnitType,
		Area:        dto.Area,
		Bedrooms:    dto.Bedrooms,
		Bathrooms:   dto.Bathrooms,
		Description: dto.Description,
		IsActive:    dto.IsActive,
		CreatedAt:   dto.CreatedAt,
		UpdatedAt:   dto.UpdatedAt,
	}
}

func MapPaginatedDTOToResponse(dto *domain.PaginatedPropertyUnitsDTO) response.PaginatedPropertyUnitsResponse {
	units := make([]response.PropertyUnitListItemResponse, len(dto.Units))
	for i, unit := range dto.Units {
		units[i] = response.PropertyUnitListItemResponse{
			ID:        unit.ID,
			Number:    unit.Number,
			Floor:     unit.Floor,
			Block:     unit.Block,
			UnitType:  unit.UnitType,
			Area:      unit.Area,
			Bedrooms:  unit.Bedrooms,
			Bathrooms: unit.Bathrooms,
			IsActive:  unit.IsActive,
		}
	}

	return response.PaginatedPropertyUnitsResponse{
		Units:      units,
		Total:      dto.Total,
		Page:       dto.Page,
		PageSize:   dto.PageSize,
		TotalPages: dto.TotalPages,
	}
}
