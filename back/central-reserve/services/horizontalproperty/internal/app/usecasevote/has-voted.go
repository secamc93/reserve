package usecasevote

import (
	"context"
)

// HasUnitVoted verifica si una unidad ya votó en una votación específica
func (uc *votingUseCase) HasUnitVoted(ctx context.Context, votingID, propertyUnitID uint) (bool, error) {
	return uc.repo.HasUnitVoted(ctx, votingID, propertyUnitID)
}
