package usecasevotings

import (
	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"context"
	"fmt"
)

// ListVotingsByGroupForDeletion obtiene todas las votaciones de un grupo para propósitos de eliminación
func (uc *VotingsUseCase) ListVotingsByGroupForDeletion(ctx context.Context, groupID uint) ([]domain.VotingDTO, error) {
	votings, err := uc.repo.ListVotingsByGroup(ctx, groupID)
	if err != nil {
		uc.logger.Error().Err(err).Uint("group_id", groupID).Msg("Error listando votaciones del grupo")
		return nil, fmt.Errorf("error listando votaciones: %w", err)
	}

	var result []domain.VotingDTO
	for _, voting := range votings {
		result = append(result, domain.VotingDTO{
			ID:                 voting.ID,
			VotingGroupID:      voting.VotingGroupID,
			Title:              voting.Title,
			Description:        voting.Description,
			VotingType:         voting.VotingType,
			IsSecret:           voting.IsSecret,
			AllowAbstention:    voting.AllowAbstention,
			DisplayOrder:       voting.DisplayOrder,
			RequiredPercentage: voting.RequiredPercentage,
			IsActive:           voting.IsActive,
			CreatedAt:          voting.CreatedAt,
			UpdatedAt:          voting.UpdatedAt,
		})
	}

	return result, nil
}
