package app

import (
	"context"

	"central_reserve/services/sporttraining/traininggroup/internal/domain"
	"central_reserve/shared/log"
)

func (uc *groupUseCase) UpdateGroup(ctx context.Context, dto domain.UpdateGroupDTO) (*domain.TrainingGroup, error) {
	ctx = log.WithFunctionCtx(ctx, "UpdateGroup")

	group := &domain.TrainingGroup{
		ID:                dto.ID,
		BusinessID:        dto.BusinessID,
		CoachID:           dto.CoachID,
		Name:              dto.Name,
		Code:              dto.Code,
		Category:          dto.Category,
		Description:       dto.Description,
		MaxCapacity:       dto.MaxCapacity,
		AgeMin:            dto.AgeMin,
		AgeMax:            dto.AgeMax,
		SkillLevelID:      dto.SkillLevelID,
		RecurringSchedule: dto.RecurringSchedule,
		PhotoURL:          dto.PhotoURL,
		IsActive:          dto.IsActive,
	}

	updated, err := uc.repo.Update(ctx, group)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msgf("Error actualizando grupo: %d", dto.ID)
		return nil, err
	}

	uc.logger.Info(ctx).Msgf("Grupo actualizado: %d", updated.ID)
	return updated, nil
}
