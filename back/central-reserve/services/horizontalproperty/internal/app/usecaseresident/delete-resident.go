package usecaseresident

import (
	"context"

	"central_reserve/services/horizontalproperty/internal/domain"
)

func (uc *residentUseCase) DeleteResident(ctx context.Context, id uint) error {
	// Verificar que el residente existe
	existing, err := uc.repo.GetResidentByID(ctx, id)
	if err != nil {
		uc.logger.Error().Err(err).Uint("id", id).Msg("Error obteniendo residente")
		return err
	}
	if existing == nil {
		return domain.ErrResidentNotFound
	}

	// Eliminar (soft delete)
	if err := uc.repo.DeleteResident(ctx, id); err != nil {
		uc.logger.Error().Err(err).Uint("id", id).Msg("Error eliminando residente")
		return err
	}

	uc.logger.Info().Uint("id", id).Msg("Residente eliminado exitosamente")
	return nil
}
