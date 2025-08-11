package mapper

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/infra/primary/http2/handlers/businesshandler/request"
	"central_reserve/internal/infra/primary/http2/handlers/businesshandler/response"
)

// ToBusinessRequest convierte el request HTTP a DTO de dominio
func ToBusinessRequest(req request.BusinessRequest) dtos.BusinessRequest {
	return dtos.BusinessRequest{
		Name:               req.Name,
		Code:               req.Code,
		BusinessTypeID:     req.BusinessTypeID,
		Timezone:           req.Timezone,
		Address:            req.Address,
		Description:        req.Description,
		LogoURL:            req.LogoURL,
		LogoFile:           req.LogoFile,
		PrimaryColor:       req.PrimaryColor,
		SecondaryColor:     req.SecondaryColor,
		CustomDomain:       req.CustomDomain,
		IsActive:           req.IsActive,
		EnableDelivery:     req.EnableDelivery,
		EnablePickup:       req.EnablePickup,
		EnableReservations: req.EnableReservations,
	}
}

// ToBusinessTypeResponse convierte el DTO de dominio a response HTTP
func ToBusinessTypeResponse(dto dtos.BusinessTypeResponse) response.BusinessTypeResponse {
	return response.BusinessTypeResponse{
		ID:          dto.ID,
		Name:        dto.Name,
		Code:        dto.Code,
		Description: dto.Description,
		Icon:        dto.Icon,
		IsActive:    dto.IsActive,
		CreatedAt:   dto.CreatedAt,
		UpdatedAt:   dto.UpdatedAt,
	}
}

// ToBusinessResponse convierte el DTO de dominio a response HTTP
func ToBusinessResponse(dto dtos.BusinessResponse) response.BusinessResponse {
	return response.BusinessResponse{
		ID:                 dto.ID,
		Name:               dto.Name,
		Code:               dto.Code,
		BusinessType:       ToBusinessTypeResponse(dto.BusinessType),
		Timezone:           dto.Timezone,
		Address:            dto.Address,
		Description:        dto.Description,
		LogoURL:            dto.LogoURL,
		PrimaryColor:       dto.PrimaryColor,
		SecondaryColor:     dto.SecondaryColor,
		CustomDomain:       dto.CustomDomain,
		IsActive:           dto.IsActive,
		EnableDelivery:     dto.EnableDelivery,
		EnablePickup:       dto.EnablePickup,
		EnableReservations: dto.EnableReservations,
		CreatedAt:          dto.CreatedAt,
		UpdatedAt:          dto.UpdatedAt,
	}
}

// ToBusinessListResponse convierte la lista de DTOs de dominio a response HTTP
func ToBusinessListResponse(dtos []dtos.BusinessResponse) response.BusinessListResponse {
	businesses := make([]response.BusinessResponse, len(dtos))
	for i, dto := range dtos {
		businesses[i] = ToBusinessResponse(dto)
	}

	return response.BusinessListResponse{
		Businesses: businesses,
		Total:      int64(len(businesses)),
		Page:       1,
		Limit:      len(businesses),
	}
}
