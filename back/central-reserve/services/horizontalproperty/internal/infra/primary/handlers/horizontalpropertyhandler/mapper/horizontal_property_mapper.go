package mapper

import (
	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/horizontalpropertyhandler/request"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/horizontalpropertyhandler/response"
)

// MapCreateRequestToDTO mapea request de creación a DTO de dominio
func MapCreateRequestToDTO(req *request.CreateHorizontalPropertyRequest) domain.CreateHorizontalPropertyDTO {
	return domain.CreateHorizontalPropertyDTO{
		Name:             req.Name,
		Code:             req.Code,
		ParentBusinessID: req.ParentBusinessID,
		Timezone:         req.Timezone,
		Address:          req.Address,
		Description:      req.Description,
		LogoURL:          req.LogoURL,
		PrimaryColor:     req.PrimaryColor,
		SecondaryColor:   req.SecondaryColor,
		TertiaryColor:    req.TertiaryColor,
		QuaternaryColor:  req.QuaternaryColor,
		NavbarImageURL:   req.NavbarImageURL,
		CustomDomain:     req.CustomDomain,
		TotalUnits:       req.TotalUnits,
		TotalFloors:      req.TotalFloors,
		HasElevator:      req.HasElevator,
		HasParking:       req.HasParking,
		HasPool:          req.HasPool,
		HasGym:           req.HasGym,
		HasSocialArea:    req.HasSocialArea,
	}
}

// MapUpdateRequestToDTO mapea request de actualización a DTO de dominio
func MapUpdateRequestToDTO(req *request.UpdateHorizontalPropertyRequest) domain.UpdateHorizontalPropertyDTO {
	return domain.UpdateHorizontalPropertyDTO{
		Name:             req.Name,
		Code:             req.Code,
		ParentBusinessID: req.ParentBusinessID,
		Timezone:         req.Timezone,
		Address:          req.Address,
		Description:      req.Description,
		LogoURL:          req.LogoURL,
		PrimaryColor:     req.PrimaryColor,
		SecondaryColor:   req.SecondaryColor,
		TertiaryColor:    req.TertiaryColor,
		QuaternaryColor:  req.QuaternaryColor,
		NavbarImageURL:   req.NavbarImageURL,
		CustomDomain:     req.CustomDomain,
		TotalUnits:       req.TotalUnits,
		TotalFloors:      req.TotalFloors,
		HasElevator:      req.HasElevator,
		HasParking:       req.HasParking,
		HasPool:          req.HasPool,
		HasGym:           req.HasGym,
		HasSocialArea:    req.HasSocialArea,
		IsActive:         req.IsActive,
	}
}

// MapListRequestToDTO mapea request de lista a DTO de filtros
func MapListRequestToDTO(req *request.ListHorizontalPropertiesRequest) domain.HorizontalPropertyFiltersDTO {
	return domain.HorizontalPropertyFiltersDTO{
		Name:     req.Name,
		Code:     req.Code,
		IsActive: req.IsActive,
		Page:     req.Page,
		PageSize: req.PageSize,
		OrderBy:  req.OrderBy,
		OrderDir: req.OrderDir,
	}
}

// MapDTOToResponse mapea DTO de dominio a response
func MapDTOToResponse(dto *domain.HorizontalPropertyDTO) *response.HorizontalPropertyResponse {
	return &response.HorizontalPropertyResponse{
		ID:               dto.ID,
		Name:             dto.Name,
		Code:             dto.Code,
		BusinessTypeID:   dto.BusinessTypeID,
		BusinessTypeName: dto.BusinessTypeName,
		ParentBusinessID: dto.ParentBusinessID,
		Timezone:         dto.Timezone,
		Address:          dto.Address,
		Description:      dto.Description,
		LogoURL:          dto.LogoURL,
		PrimaryColor:     dto.PrimaryColor,
		SecondaryColor:   dto.SecondaryColor,
		TertiaryColor:    dto.TertiaryColor,
		QuaternaryColor:  dto.QuaternaryColor,
		NavbarImageURL:   dto.NavbarImageURL,
		CustomDomain:     dto.CustomDomain,
		TotalUnits:       dto.TotalUnits,
		TotalFloors:      dto.TotalFloors,
		HasElevator:      dto.HasElevator,
		HasParking:       dto.HasParking,
		HasPool:          dto.HasPool,
		HasGym:           dto.HasGym,
		HasSocialArea:    dto.HasSocialArea,
		IsActive:         dto.IsActive,
		CreatedAt:        dto.CreatedAt,
		UpdatedAt:        dto.UpdatedAt,
	}
}

// MapPaginatedDTOToResponse mapea DTO paginado a response
func MapPaginatedDTOToResponse(dto *domain.PaginatedHorizontalPropertyDTO) *response.PaginatedHorizontalPropertyResponse {
	data := make([]response.HorizontalPropertyListResponse, len(dto.Data))
	for i, item := range dto.Data {
		data[i] = response.HorizontalPropertyListResponse{
			ID:               item.ID,
			Name:             item.Name,
			Code:             item.Code,
			BusinessTypeName: item.BusinessTypeName,
			Address:          item.Address,
			TotalUnits:       item.TotalUnits,
			IsActive:         item.IsActive,
			CreatedAt:        item.CreatedAt,
		}
	}

	return &response.PaginatedHorizontalPropertyResponse{
		Data:       data,
		Total:      dto.Total,
		Page:       dto.Page,
		PageSize:   dto.PageSize,
		TotalPages: dto.TotalPages,
	}
}
