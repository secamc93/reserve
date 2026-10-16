package mappers

import (
	"central_reserve/services/horizontalproperty/resident/internal/domain"
	"central_reserve/services/horizontalproperty/resident/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/resident/internal/infra/primary/handlers/response"
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
		AllowEmptyDni:    false,
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
		BusinessID:         businessID,
		PropertyUnitNumber: req.PropertyUnitNumber,
		Name:               req.Name,
		Dni:                req.Dni,
		PropertyUnitID:     req.PropertyUnitID,
		ResidentTypeID:     req.ResidentTypeID,
		IsActive:           req.IsActive,
		IsMainResident:     req.IsMainResident,
		Query:              req.Q,
		Block:              req.PropertyUnitBlock,
		WithoutEmail:       req.WithoutEmail,
		Page:               req.Page,
		PageSize:           req.PageSize,
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
			PropertyUnitBlock:  res.PropertyUnitBlock,
			Dni:                res.Dni,
			Since:              res.Since,
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

func MapSummaryDTOToResponse(dto *domain.ResidentsSummaryDTO) response.ResidentsSummaryResponse {
	types := make([]response.ResidentTypeCountResponse, len(dto.Types))
	for i, t := range dto.Types {
		types[i] = response.ResidentTypeCountResponse{ResidentTypeID: t.ResidentTypeID, Name: t.Name, Code: t.Code, Total: t.Total}
	}
	return response.ResidentsSummaryResponse{
		Total: dto.Total, Active: dto.Active, Inactive: dto.Inactive, Main: dto.Main, WithoutEmail: dto.WithoutEmail, Types: types,
	}
}

func MapOverviewDTOToResponse(dto *domain.ResidentOverviewDTO) response.ResidentOverviewResponse {
	housemates := make([]response.HousemateResponse, len(dto.Housemates))
	for i, h := range dto.Housemates {
		housemates[i] = response.HousemateResponse{ID: h.ID, Name: h.Name, TypeName: h.TypeName, IsMain: h.IsMain}
	}
	activity := make([]response.ActivityResponse, len(dto.Activity))
	for i, a := range dto.Activity {
		activity[i] = response.ActivityResponse{Kind: a.Kind, Title: a.Title, Subtitle: a.Subtitle, At: a.At}
	}
	return response.ResidentOverviewResponse{
		Stats: response.ResidentOverviewStatsResponse{
			Visits30d: dto.Stats.Visits30d, PackagesPending: dto.Stats.PackagesPending, Reservations: dto.Stats.Reservations,
			VotesCast: dto.Stats.VotesCast, VotesTotal: dto.Stats.VotesTotal,
		},
		Housemates: housemates,
		Activity:   activity,
	}
}
