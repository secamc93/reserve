package usecasevotinggroups

import (
	"context"
	"fmt"

	"central_reserve/shared/log"
)

func (u *VotingGroupUseCase) DeleteVotingGroup(ctx context.Context, id uint) error {
	ctx = log.WithFunctionCtx(ctx, "DeleteVotingGroup")

	// Obtener las votaciones del grupo antes de eliminar (para limpiar cache)
	votings, err := u.repo.ListVotingsByGroup(ctx, id)
	if err != nil {
		u.logger.Error(ctx).Err(err).Uint("group_id", id).Msg("Error obteniendo votaciones del grupo antes de eliminar")
		return fmt.Errorf("error obteniendo votaciones del grupo: %w", err)
	}

	// Eliminar el grupo (esto eliminará en cascada las votaciones, opciones y votos)
	if err := u.repo.DeleteVotingGroup(ctx, id); err != nil {
		u.logger.Error(ctx).Err(err).Uint("group_id", id).Msg("Error eliminando grupo de votación")
		return err
	}

	// Limpiar cache de todas las votaciones del grupo
	for _, voting := range votings {
		if err := u.cache.ClearVoting(voting.ID); err != nil {
			u.logger.Error(ctx).Err(err).Uint("voting_id", voting.ID).Msg("Error limpiando cache de votación")
			// No retornamos error, el grupo ya fue eliminado
		}
	}

	u.logger.Info(ctx).Uint("group_id", id).Int("votings_cleared", len(votings)).Msg("Grupo de votación eliminado y cache limpiado")
	return nil
}
