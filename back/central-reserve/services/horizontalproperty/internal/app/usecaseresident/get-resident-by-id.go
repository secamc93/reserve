package usecaseresident

import (
	"context"

	"central_reserve/services/horizontalproperty/internal/domain"
)

func (uc *residentUseCase) GetResidentByID(ctx context.Context, id uint) (*domain.ResidentDetailDTO, error) {
	resident, err := uc.repo.GetResidentByID(ctx, id)
	if err != nil {
		uc.logger.Error().Err(err).Uint("id", id).Msg("Error obteniendo residente")
		return nil, err
	}

	if resident == nil {
		return nil, domain.ErrResidentNotFound
	}

	return resident, nil
}
