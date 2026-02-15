package usecasepublic

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

// ListVotingsByGroupWithVoteStatus obtiene todas las votaciones de un grupo con estado de voto
func (uc *PublicUseCase) ListVotingsByGroupWithVoteStatus(
	ctx context.Context,
	groupID uint,
	propertyUnitID uint,
) ([]domain.VotingWithStatusDTO, error) {
	uc.logger.Info(ctx).
		Uint("group_id", groupID).
		Uint("property_unit_id", propertyUnitID).
		Msg("Obteniendo votaciones del grupo con estado de voto")

	votings, err := uc.repo.ListVotingsByGroupWithVoteStatus(ctx, groupID, propertyUnitID)
	if err != nil {
		uc.logger.Error(ctx).
			Err(err).
			Uint("group_id", groupID).
			Uint("property_unit_id", propertyUnitID).
			Msg("Error obteniendo votaciones del grupo")
		return nil, fmt.Errorf("error obteniendo votaciones del grupo: %w", err)
	}

	uc.logger.Info(ctx).
		Uint("group_id", groupID).
		Uint("property_unit_id", propertyUnitID).
		Int("count", len(votings)).
		Msg("✅ Votaciones del grupo obtenidas exitosamente")

	return votings, nil
}
