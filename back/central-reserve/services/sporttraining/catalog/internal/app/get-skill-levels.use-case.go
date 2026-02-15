package app

import (
	"context"

	"central_reserve/services/sporttraining/catalog/internal/domain"
	"central_reserve/shared/log"
)

func (uc *catalogUseCase) GetSkillLevels(ctx context.Context) ([]domain.PlayerSkillLevel, error) {
	ctx = log.WithFunctionCtx(ctx, "GetSkillLevels")

	levels, err := uc.repo.GetSkillLevels(ctx)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error obteniendo niveles de habilidad")
		return nil, err
	}

	return levels, nil
}
