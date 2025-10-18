package usecasevote

import (
	"context"
	"fmt"
)

// DeleteVote elimina un voto específico
func (uc *votingUseCase) DeleteVote(ctx context.Context, voteID uint) error {
	// Validar que el voteID sea válido
	if voteID == 0 {
		return fmt.Errorf("el ID del voto es requerido")
	}

	// Eliminar el voto
	if err := uc.repo.DeleteVote(ctx, voteID); err != nil {
		uc.logger.Error().Err(err).Uint("vote_id", voteID).Msg("Error eliminando voto")
		return err
	}

	uc.logger.Info().Uint("vote_id", voteID).Msg("Voto eliminado exitosamente")
	return nil
}
