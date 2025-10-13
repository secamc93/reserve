package usecasevote

import (
	"context"

	"central_reserve/services/horizontalproperty/internal/domain"
)

// GetResidentVote obtiene el voto de un residente en una votación específica
func (uc *votingUseCase) GetResidentVote(ctx context.Context, votingID, residentID uint) (*domain.VoteDTO, error) {
	vote, err := uc.repo.GetResidentVote(ctx, votingID, residentID)
	if err != nil {
		return nil, err
	}

	return &domain.VoteDTO{
		ID:             vote.ID,
		VotingID:       vote.VotingID,
		ResidentID:     vote.ResidentID,
		VotingOptionID: vote.VotingOptionID,
		OptionText:     vote.OptionText,
		OptionCode:     vote.OptionCode,
		VotedAt:        vote.VotedAt,
		IPAddress:      vote.IPAddress,
		UserAgent:      vote.UserAgent,
		Notes:          vote.Notes,
	}, nil
}
