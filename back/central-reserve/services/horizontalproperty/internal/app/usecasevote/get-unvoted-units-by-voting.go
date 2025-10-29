package usecasevote

import (
	"context"

	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/shared/log"
)

// GetUnvotedUnitsByVoting obtiene las unidades que no han votado en una votación específica
func (uc *votingUseCase) GetUnvotedUnitsByVoting(ctx context.Context, votingID uint, unitNumberFilter string) ([]domain.UnvotedUnitDTO, error) {
	// Configurar contexto de logging
	ctx = log.WithFunctionCtx(ctx, "FunctionName")
	// Obtener unidades sin votar del repositorio
	unvotedUnits, err := uc.repo.GetUnvotedUnitsByVoting(ctx, votingID, unitNumberFilter)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("voting_id", votingID).Msg("Error obteniendo unidades sin votar")
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
