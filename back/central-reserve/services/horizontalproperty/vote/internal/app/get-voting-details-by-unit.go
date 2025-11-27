package app

import (
	"context"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

// GetVotingDetailsByUnit obtiene el detalle completo de la votación por cada unidad
func (uc *votingUseCase) GetVotingDetailsByUnit(ctx context.Context, votingID, hpID uint) ([]domain.VotingDetailByUnitDTO, error) {
	return uc.repo.GetVotingDetailsByUnit(ctx, votingID, hpID)
}
