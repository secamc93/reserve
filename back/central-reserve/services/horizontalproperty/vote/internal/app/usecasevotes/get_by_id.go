package usecasevotes

import (
	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"context"
	"fmt"
)

// GetVoteByID obtiene un voto por su ID
func (uc *VotesUseCase) GetVoteByID(ctx context.Context, voteID uint) (*domain.VoteDTO, error) {
	vote, err := uc.repo.GetVoteByID(ctx, voteID)
	if err != nil {
		uc.logger.Error().Err(err).Uint("vote_id", voteID).Msg("Error obteniendo voto por ID")
		return nil, fmt.Errorf("error obteniendo voto: %w", err)
	}

	return &domain.VoteDTO{
		ID:             vote.ID,
		VotingID:       vote.VotingID,
		PropertyUnitID: vote.PropertyUnitID,
		VotingOptionID: vote.VotingOptionID,
		OptionText:     vote.OptionText,
		OptionCode:     vote.OptionCode,
		VotedAt:        vote.VotedAt,
	}, nil
}
