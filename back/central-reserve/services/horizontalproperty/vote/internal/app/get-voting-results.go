package app

import (
	"context"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

// GetVotingResults obtiene los resultados (conteo y porcentajes) de una votación
func (uc *votingUseCase) GetVotingResults(ctx context.Context, votingID uint) ([]domain.VotingResultDTO, error) {
	return uc.repo.GetVotingResults(ctx, votingID)
}
