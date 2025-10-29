package usecasevote

import (
	"context"
	"fmt"

	"central_reserve/shared/log"
)

// DeleteVote elimina un voto específico
func (uc *votingUseCase) DeleteVote(ctx context.Context, voteID uint) error {
	// Configurar contexto de logging
	ctx = log.WithFunctionCtx(ctx, "DeleteVote")

	// Validar que el voteID sea válido
	if voteID == 0 {
		uc.logger.Error(ctx).Uint("vote_id", voteID).Msg("ID del voto es requerido")
		return fmt.Errorf("el ID del voto es requerido")
	}

	// Eliminar el voto
	if err := uc.repo.DeleteVote(ctx, voteID); err != nil {
		uc.logger.Error(ctx).Err(err).Uint("vote_id", voteID).Msg("Error eliminando voto en repositorio")
		return err
	}

	return nil
}
