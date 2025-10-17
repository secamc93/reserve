package usecasevote

import (
	"context"

	"central_reserve/services/horizontalproperty/internal/domain"
)

// GetUnvotedUnitsByVoting obtiene las unidades que no han votado en una votación específica
func (uc *votingUseCase) GetUnvotedUnitsByVoting(ctx context.Context, votingID uint, unitNumberFilter string) ([]domain.UnvotedUnitDTO, error) {
	// Obtener unidades sin votar del repositorio
	unvotedUnits, err := uc.repo.GetUnvotedUnitsByVoting(ctx, votingID, unitNumberFilter)
	if err != nil {
		uc.logger.Error().Err(err).Uint("voting_id", votingID).Msg("Error obteniendo unidades sin votar")
		return nil, err
	}

	// Convertir a DTOs
	dtos := make([]domain.UnvotedUnitDTO, len(unvotedUnits))
	for i, unit := range unvotedUnits {
		dtos[i] = domain.UnvotedUnitDTO{
			UnitID:       unit.UnitID,
			UnitNumber:   unit.UnitNumber,
			ResidentID:   unit.ResidentID,
			ResidentName: unit.ResidentName,
		}
	}

	uc.logger.Info().Uint("voting_id", votingID).Str("unit_filter", unitNumberFilter).Int("count", len(dtos)).Msg("Unidades sin votar obtenidas")
	return dtos, nil
}
