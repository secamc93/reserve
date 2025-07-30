package mapper

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/infra/primary/http2/handlers/authhandler/request"
	"central_reserve/internal/infra/primary/http2/handlers/authhandler/response"
)

// ToGenerateAPIKeyRequest convierte el request HTTP a DTO de dominio
func ToGenerateAPIKeyRequest(req request.GenerateAPIKeyRequest, requesterID uint) dtos.GenerateAPIKeyRequest {
	return dtos.GenerateAPIKeyRequest{
		UserID:      req.UserID,
		BusinessID:  req.BusinessID,
		Name:        req.Name,
		Description: req.Description,
		RequesterID: requesterID,
	}
}

// ToGenerateAPIKeyResponse convierte el DTO de dominio a response HTTP
func ToGenerateAPIKeyResponse(dto *dtos.GenerateAPIKeyResponse) response.GenerateAPIKeyResponse {
	return response.GenerateAPIKeyResponse{
		Success:     dto.Success,
		Message:     dto.Message,
		APIKey:      dto.APIKey,
		UserID:      dto.APIKeyInfo.UserID,
		BusinessID:  dto.APIKeyInfo.BusinessID,
		Name:        dto.APIKeyInfo.Name,
		Description: dto.APIKeyInfo.Description,
		RateLimit:   dto.APIKeyInfo.RateLimit,
		CreatedAt:   dto.APIKeyInfo.CreatedAt,
	}
}
