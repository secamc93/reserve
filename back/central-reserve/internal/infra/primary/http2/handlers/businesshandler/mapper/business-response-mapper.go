package mapper

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/domain/entities"
	"central_reserve/internal/infra/primary/http2/handlers/businesshandler/request"
	"central_reserve/internal/infra/primary/http2/handlers/businesshandler/response"
)

// RequestToDTO convierte request.BusinessRequest a dtos.BusinessRequest
func RequestToDTO(req request.BusinessRequest) dtos.BusinessRequest {
	return dtos.BusinessRequest{
		Name:               req.Name,
		Code:               req.Code,
		BusinessTypeID:     req.BusinessTypeID,
		Timezone:           req.Timezone,
		Address:            req.Address,
		Description:        req.Description,
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

// RequestToUpdateDTO convierte request.BusinessRequest a dtos.UpdateBusinessRequest
func RequestToUpdateDTO(req request.BusinessRequest) dtos.UpdateBusinessRequest {
	return dtos.UpdateBusinessRequest{
		Name:               &req.Name,
		Code:               &req.Code,
		BusinessTypeID:     &req.BusinessTypeID,
		Timezone:           &req.Timezone,
		Address:            &req.Address,
		Description:        &req.Description,
		LogoFile:           req.LogoFile,
		PrimaryColor:       &req.PrimaryColor,
		SecondaryColor:     &req.SecondaryColor,
		CustomDomain:       &req.CustomDomain,
		IsActive:           &req.IsActive,
		EnableDelivery:     &req.EnableDelivery,
		EnablePickup:       &req.EnablePickup,
		EnableReservations: &req.EnableReservations,
	}
}

// BusinessToResponse convierte una entidad Business del dominio a BusinessResponse
func BusinessToResponse(business entities.Business) response.BusinessResponse {
	return response.BusinessResponse{
		ID:             business.ID,
		Name:           business.Name,
		Description:    business.Description,
		Address:        business.Address,
		Phone:          "", // Campo no disponible en la entidad
		Email:          "", // Campo no disponible en la entidad
		Website:        "", // Campo no disponible en la entidad
		LogoURL:        business.LogoURL,
		IsActive:       business.DeletedAt == nil,
		BusinessTypeID: business.BusinessTypeID,
		BusinessType:   "", // Se llenará desde el handler
		CreatedAt:      business.CreatedAt,
		UpdatedAt:      business.UpdatedAt,
	}
}

// BusinessDTOToResponse convierte un DTO BusinessResponse a response.BusinessResponse
func BusinessDTOToResponse(businessDTO dtos.BusinessResponse) response.BusinessResponse {
	return response.BusinessResponse{
		ID:             businessDTO.ID,
		Name:           businessDTO.Name,
		Description:    businessDTO.Description,
		Address:        businessDTO.Address,
		Phone:          "", // Campo no disponible en el DTO
		Email:          "", // Campo no disponible en el DTO
		Website:        "", // Campo no disponible en el DTO
		LogoURL:        businessDTO.LogoURL,
		IsActive:       businessDTO.IsActive,
		BusinessTypeID: businessDTO.BusinessType.ID,
		BusinessType:   "", // Se llenará desde el handler
		CreatedAt:      businessDTO.CreatedAt,
		UpdatedAt:      businessDTO.UpdatedAt,
	}
}

// BusinessesToResponse convierte un slice de entidades Business a slice de BusinessResponse
func BusinessesToResponse(businesses []entities.Business) []response.BusinessResponse {
	responses := make([]response.BusinessResponse, len(businesses))
	for i, business := range businesses {
		responses[i] = BusinessToResponse(business)
	}
	return responses
}

// BusinessDTOsToResponse convierte un slice de DTOs BusinessResponse a slice de response.BusinessResponse
func BusinessDTOsToResponse(businessDTOs []dtos.BusinessResponse) []response.BusinessResponse {
	responses := make([]response.BusinessResponse, len(businessDTOs))
	for i, businessDTO := range businessDTOs {
		responses[i] = BusinessDTOToResponse(businessDTO)
	}
	return responses
}

// BuildGetBusinessesResponse construye la respuesta completa para obtener múltiples negocios
func BuildGetBusinessesResponse(businesses []entities.Business, message string) response.GetBusinessesResponse {
	return response.GetBusinessesResponse{
		Success: true,
		Message: message,
		Data:    BusinessesToResponse(businesses),
	}
}

// BuildGetBusinessesResponseFromDTOs construye la respuesta completa para obtener múltiples negocios desde DTOs
func BuildGetBusinessesResponseFromDTOs(businessDTOs []dtos.BusinessResponse, message string) response.GetBusinessesResponse {
	return response.GetBusinessesResponse{
		Success: true,
		Message: message,
		Data:    BusinessDTOsToResponse(businessDTOs),
	}
}

// BuildGetBusinessResponse construye la respuesta completa para obtener un negocio
func BuildGetBusinessResponse(business entities.Business, message string) response.GetBusinessResponse {
	return response.GetBusinessResponse{
		Success: true,
		Message: message,
		Data:    BusinessToResponse(business),
	}
}

// BuildCreateBusinessResponse construye la respuesta completa para crear un negocio
func BuildCreateBusinessResponse(business entities.Business, message string) response.CreateBusinessResponse {
	return response.CreateBusinessResponse{
		Success: true,
		Message: message,
		Data:    BusinessToResponse(business),
	}
}

// BuildUpdateBusinessResponse construye la respuesta completa para actualizar un negocio
func BuildUpdateBusinessResponse(business entities.Business, message string) response.UpdateBusinessResponse {
	return response.UpdateBusinessResponse{
		Success: true,
		Message: message,
		Data:    BusinessToResponse(business),
	}
}

// BuildDeleteBusinessResponse construye la respuesta completa para eliminar un negocio
func BuildDeleteBusinessResponse(message string) response.DeleteBusinessResponse {
	return response.DeleteBusinessResponse{
		Success: true,
		Message: message,
	}
}

// BuildErrorResponse construye una respuesta de error
func BuildErrorResponse(error string, message string) response.ErrorResponse {
	return response.ErrorResponse{
		Success: false,
		Error:   error,
		Message: message,
	}
}

// BuildCreateBusinessResponseFromDTO construye la respuesta completa para crear un negocio desde un DTO
func BuildCreateBusinessResponseFromDTO(businessDTO *dtos.BusinessResponse, message string) response.CreateBusinessResponse {
	return response.CreateBusinessResponse{
		Success: true,
		Message: message,
		Data:    BusinessDTOToResponse(*businessDTO),
	}
}

// BuildGetBusinessResponseFromDTO construye la respuesta completa para obtener un negocio desde un DTO
func BuildGetBusinessResponseFromDTO(businessDTO *dtos.BusinessResponse, message string) response.GetBusinessResponse {
	return response.GetBusinessResponse{
		Success: true,
		Message: message,
		Data:    BusinessDTOToResponse(*businessDTO),
	}
}

// BuildUpdateBusinessResponseFromDTO construye la respuesta completa para actualizar un negocio desde un DTO
func BuildUpdateBusinessResponseFromDTO(businessDTO *dtos.BusinessResponse, message string) response.UpdateBusinessResponse {
	return response.UpdateBusinessResponse{
		Success: true,
		Message: message,
		Data:    BusinessDTOToResponse(*businessDTO),
	}
}
