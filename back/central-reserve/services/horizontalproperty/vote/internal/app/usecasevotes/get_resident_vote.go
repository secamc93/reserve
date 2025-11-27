package usecasevotes

import (
	"context"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

// GetUnitVote obtiene el voto de una unidad en una votación específica
func (uc *VotesUseCase) GetUnitVote(ctx context.Context, votingID, propertyUnitID uint) (*domain.VoteDTO, error) {
	vote, err := uc.repo.GetUnitVote(ctx, votingID, propertyUnitID)
	if err != nil {
		return nil, err
	}

	return &domain.VoteDTO{
		ID:             vote.ID,
		VotingID:       vote.VotingID,
		PropertyUnitID: vote.PropertyUnitID,
		VotingOptionID: vote.VotingOptionID,
		OptionText:     vote.OptionText,
		OptionCode:     vote.OptionCode,
		VotedAt:        vote.VotedAt,
		IPAddress:      vote.IPAddress,
		UserAgent:      vote.UserAgent,
		Notes:          vote.Notes,
	}, nil
}
