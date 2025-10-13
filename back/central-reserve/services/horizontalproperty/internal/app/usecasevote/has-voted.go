package usecasevote

import (
	"context"
)

// HasResidentVoted verifica si un residente ya votó en una votación específica
func (uc *votingUseCase) HasResidentVoted(ctx context.Context, votingID, residentID uint) (bool, error) {
	return uc.repo.HasResidentVoted(ctx, votingID, residentID)
}
