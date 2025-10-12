package mapper

import (
	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerresident/request"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerresident/response"
)

func MapCreateRequestToDTO(req request.CreateResidentRequest, businessID uint) domain.CreateResidentDTO {
	return domain.CreateResidentDTO{
		BusinessID:       businessID,
		PropertyUnitID:   req.PropertyUnitID,
		ResidentTypeID:   req.ResidentTypeID,
		Name:             req.Name,
		Email:            req.Email,
		Phone:            req.Phone,
		Dni:              req.Dni,
		EmergencyContact: req.EmergencyContact,
		IsMainResident:   req.IsMainResident,
		MoveInDate:       req.MoveInDate,
		LeaseStartDate:   req.LeaseStartDate,
		LeaseEndDate:     req.LeaseEndDate,
		MonthlyRent:      req.MonthlyRent,
	}
}

func MapUpdateRequestToDTO(req request.UpdateResidentRequest) domain.UpdateResidentDTO {
	return domain.UpdateResidentDTO{
		PropertyUnitID:   req.PropertyUnitID,
		ResidentTypeID:   req.ResidentTypeID,
		Name:             req.Name,
		Email:            req.Email,
		Phone:            req.Phone,
		Dni:              req.Dni,
		EmergencyContact: req.EmergencyContact,
		IsMainResident:   req.IsMainResident,
		IsActive:         req.IsActive,
		MoveInDate:       req.MoveInDate,
		MoveOutDate:      req.MoveOutDate,
		LeaseStartDate:   req.LeaseStartDate,
		LeaseEndDate:     req.LeaseEndDate,
		MonthlyRent:      req.MonthlyRent,
	}
}

func MapFiltersRequestToDTO(req request.ResidentFiltersRequest, businessID uint) domain.ResidentFiltersDTO {
	return domain.ResidentFiltersDTO{
		BusinessID:     businessID,
		PropertyUnitID: req.PropertyUnitID,
		ResidentTypeID: req.ResidentTypeID,
		IsActive:       req.IsActive,
		IsMainResident: req.IsMainResident,
		Page:           req.Page,
		PageSize:       req.PageSize,
	}
}

func MapDetailDTOToResponse(dto *domain.ResidentDetailDTO) response.ResidentResponse {
	return response.ResidentResponse{
		ID:                 dto.ID,
		BusinessID:         dto.BusinessID,
		PropertyUnitID:     dto.PropertyUnitID,
		PropertyUnitNumber: dto.PropertyUnitNumber,
		ResidentTypeID:     dto.ResidentTypeID,
		ResidentTypeName:   dto.ResidentTypeName,
		ResidentTypeCode:   dto.ResidentTypeCode,
		Name:               dto.Name,
		Email:              dto.Email,
		Phone:              dto.Phone,
		Dni:                dto.Dni,
		EmergencyContact:   dto.EmergencyContact,
		IsMainResident:     dto.IsMainResident,
		IsActive:           dto.IsActive,
		MoveInDate:         dto.MoveInDate,
		MoveOutDate:        dto.MoveOutDate,
		LeaseStartDate:     dto.LeaseStartDate,
		LeaseEndDate:       dto.LeaseEndDate,
		MonthlyRent:        dto.MonthlyRent,
		CreatedAt:          dto.CreatedAt,
		UpdatedAt:          dto.UpdatedAt,
	}
}

func MapPaginatedDTOToResponse(dto *domain.PaginatedResidentsDTO) response.PaginatedResidentsResponse {
	residents := make([]response.ResidentListItemResponse, len(dto.Residents))
	for i, res := range dto.Residents {
		residents[i] = response.ResidentListItemResponse{
			ID:                 res.ID,
			PropertyUnitNumber: res.PropertyUnitNumber,
			ResidentTypeName:   res.ResidentTypeName,
			Name:               res.Name,
			Email:              res.Email,
			Phone:              res.Phone,
			IsMainResident:     res.IsMainResident,
			IsActive:           res.IsActive,
		}
	}
	return response.PaginatedResidentsResponse{
		Residents:  residents,
		Total:      dto.Total,
		Page:       dto.Page,
		PageSize:   dto.PageSize,
		TotalPages: dto.TotalPages,
	}
}
