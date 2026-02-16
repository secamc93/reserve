package usecasevotes

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

// ResetVoting elimina todos los votos de una votación (mantiene asistencia)
func (uc *VotesUseCase) ResetVoting(ctx context.Context, votingID uint) (*domain.ResetVotingResultDTO, error) {
	if votingID == 0 {
		return nil, fmt.Errorf("voting_id es requerido")
	}

	deletedCount, err := uc.repo.DeleteAllVotesByVoting(ctx, votingID)
	if err != nil {
		uc.logger.Error().Err(err).Uint("voting_id", votingID).Msg("Error reseteando votación")
		return nil, fmt.Errorf("error reseteando votación: %w", err)
	}

	// Limpiar cache SSE para que los clientes reconecten con estado vacío
	if err := uc.cache.ClearVoting(votingID); err != nil {
		uc.logger.Error().Err(err).Uint("voting_id", votingID).Msg("Error limpiando cache de votación")
		// No retornar error, el reseteo en BD ya se hizo
	}

	uc.logger.Info().Uint("voting_id", votingID).Int64("deleted_count", deletedCount).Msg("Votación reseteada exitosamente")

	return &domain.ResetVotingResultDTO{
		VotingID:     votingID,
		DeletedCount: int(deletedCount),
	}, nil
}
