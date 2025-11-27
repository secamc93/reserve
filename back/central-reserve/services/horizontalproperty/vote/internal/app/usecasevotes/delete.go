package usecasevotes

import (
	"context"
	"fmt"

	"central_reserve/shared/log"
)

// DeleteVote elimina un voto específico
func (uc *VotesUseCase) DeleteVote(ctx context.Context, voteID uint) error {
	// Configurar contexto de logging
	ctx = log.WithFunctionCtx(ctx, "DeleteVote")

	// Validar que el voteID sea válido
	if voteID == 0 {
		uc.logger.Error(ctx).Uint("vote_id", voteID).Msg("ID del voto es requerido")
		return fmt.Errorf("el ID del voto es requerido")
	}

	// Obtener el voto primero para tener el votingID (necesario para el cache)
	vote, err := uc.repo.GetVoteByID(ctx, voteID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("vote_id", voteID).Msg("Error obteniendo voto antes de eliminar")
		return err
	}

	// Eliminar el voto
	if err := uc.repo.DeleteVote(ctx, voteID); err != nil {
		uc.logger.Error(ctx).Err(err).Uint("vote_id", voteID).Msg("Error eliminando voto en repositorio")
		return err
	}

	// Remover voto del cache para SSE en tiempo real
	if err := uc.cache.RemoveVote(vote.VotingID, voteID); err != nil {
		uc.logger.Error(ctx).Err(err).Uint("vote_id", voteID).Uint("voting_id", vote.VotingID).Msg("Error removiendo voto del cache")
		// No retornamos error, el voto ya fue eliminado exitosamente
	}

	return nil
}
