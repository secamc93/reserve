package usecasevotes

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

// GetPreviousVotingVotedUnits obtiene las unidades que votaron en la votación anterior del mismo grupo
func (uc *VotesUseCase) GetPreviousVotingVotedUnits(ctx context.Context, votingID uint, groupID uint) (*domain.PreviousVotingVotedUnitsDTO, error) {
	if votingID == 0 {
		return nil, fmt.Errorf("voting_id es requerido")
	}
	if groupID == 0 {
		return nil, fmt.Errorf("group_id es requerido")
	}

	// Buscar la votación anterior en el mismo grupo
	previousVoting, err := uc.repo.GetPreviousVoting(ctx, votingID, groupID)
	if err != nil {
		uc.logger.Error().Err(err).Uint("voting_id", votingID).Uint("group_id", groupID).Msg("Error obteniendo votación anterior")
		return nil, fmt.Errorf("error obteniendo votación anterior: %w", err)
	}
	if previousVoting == nil {
		return nil, fmt.Errorf("no hay votación anterior en este grupo")
	}

	// Obtener los unit IDs que votaron en la votación anterior
	votedUnitIDs, err := uc.repo.GetVotedUnitIDsByVoting(ctx, previousVoting.ID)
	if err != nil {
		uc.logger.Error().Err(err).Uint("previous_voting_id", previousVoting.ID).Msg("Error obteniendo unidades que votaron")
		return nil, fmt.Errorf("error obteniendo unidades que votaron: %w", err)
	}

	uc.logger.Info().
		Uint("voting_id", votingID).
		Uint("previous_voting_id", previousVoting.ID).
		Int("voted_units", len(votedUnitIDs)).
		Msg("Unidades de votación anterior obtenidas")

	return &domain.PreviousVotingVotedUnitsDTO{
		PreviousVotingID:    previousVoting.ID,
		PreviousVotingTitle: previousVoting.Title,
		VotedUnitIDs:        votedUnitIDs,
		TotalVoted:          len(votedUnitIDs),
	}, nil
}
