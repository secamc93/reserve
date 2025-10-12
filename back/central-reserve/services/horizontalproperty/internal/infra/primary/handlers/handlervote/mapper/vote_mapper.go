package mapper

import (
	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/response"
)

// MapVotingGroupDTOToResponse mapea DTO de dominio a response
func MapVotingGroupDTOToResponse(dto *domain.VotingGroupDTO) response.VotingGroupResponse {
	return response.VotingGroupResponse{
		ID:               dto.ID,
		BusinessID:       dto.BusinessID,
		Name:             dto.Name,
		Description:      dto.Description,
		VotingStartDate:  dto.VotingStartDate,
		VotingEndDate:    dto.VotingEndDate,
		IsActive:         dto.IsActive,
		RequiresQuorum:   dto.RequiresQuorum,
		QuorumPercentage: dto.QuorumPercentage,
		CreatedByUserID:  dto.CreatedByUserID,
		Notes:            dto.Notes,
		CreatedAt:        dto.CreatedAt,
		UpdatedAt:        dto.UpdatedAt,
	}
}

// MapVotingGroupDTOsToResponses mapea slice de DTOs a responses
func MapVotingGroupDTOsToResponses(dtos []domain.VotingGroupDTO) []response.VotingGroupResponse {
	responses := make([]response.VotingGroupResponse, len(dtos))
	for i, dto := range dtos {
		responses[i] = MapVotingGroupDTOToResponse(&dto)
	}
	return responses
}

// MapVotingDTOToResponse mapea DTO de votación a response
func MapVotingDTOToResponse(dto *domain.VotingDTO) response.VotingResponse {
	return response.VotingResponse{
		ID:                 dto.ID,
		VotingGroupID:      dto.VotingGroupID,
		Title:              dto.Title,
		Description:        dto.Description,
		VotingType:         dto.VotingType,
		IsSecret:           dto.IsSecret,
		AllowAbstention:    dto.AllowAbstention,
		IsActive:           dto.IsActive,
		DisplayOrder:       dto.DisplayOrder,
		RequiredPercentage: dto.RequiredPercentage,
		CreatedAt:          dto.CreatedAt,
		UpdatedAt:          dto.UpdatedAt,
	}
}

// MapVotingDTOsToResponses mapea slice de DTOs de votación a responses
func MapVotingDTOsToResponses(dtos []domain.VotingDTO) []response.VotingResponse {
	responses := make([]response.VotingResponse, len(dtos))
	for i, dto := range dtos {
		responses[i] = MapVotingDTOToResponse(&dto)
	}
	return responses
}

// MapVotingOptionDTOToResponse mapea DTO de opción a response
func MapVotingOptionDTOToResponse(dto *domain.VotingOptionDTO) response.VotingOptionResponse {
	return response.VotingOptionResponse{
		ID:           dto.ID,
		VotingID:     dto.VotingID,
		OptionText:   dto.OptionText,
		OptionCode:   dto.OptionCode,
		DisplayOrder: dto.DisplayOrder,
		IsActive:     dto.IsActive,
	}
}

// MapVotingOptionDTOsToResponses mapea slice de DTOs de opciones a responses
func MapVotingOptionDTOsToResponses(dtos []domain.VotingOptionDTO) []response.VotingOptionResponse {
	responses := make([]response.VotingOptionResponse, len(dtos))
	for i, dto := range dtos {
		responses[i] = MapVotingOptionDTOToResponse(&dto)
	}
	return responses
}

// MapVoteDTOToResponse mapea DTO de voto a response
func MapVoteDTOToResponse(dto *domain.VoteDTO) response.VoteResponse {
	return response.VoteResponse{
		ID:             dto.ID,
		VotingID:       dto.VotingID,
		ResidentID:     dto.ResidentID,
		VotingOptionID: dto.VotingOptionID,
		VotedAt:        dto.VotedAt,
		IPAddress:      dto.IPAddress,
		UserAgent:      dto.UserAgent,
		Notes:          dto.Notes,
	}
}

// MapVoteDTOsToResponses mapea slice de DTOs de votos a responses
func MapVoteDTOsToResponses(dtos []domain.VoteDTO) []response.VoteResponse {
	responses := make([]response.VoteResponse, len(dtos))
	for i, dto := range dtos {
		responses[i] = MapVoteDTOToResponse(&dto)
	}
	return responses
}
