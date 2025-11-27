package app

import (
	"context"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

// GetUnitsWithResidents obtiene todas las unidades con su residente principal
func (uc *votingUseCase) GetUnitsWithResidents(ctx context.Context, hpID uint) ([]domain.UnitWithResidentDTO, error) {
	return uc.repo.GetUnitsWithResidents(ctx, hpID)
}
