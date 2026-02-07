package app

import (
	"context"

	"central_reserve/services/sporttraining/traininggroup/internal/domain"
	"central_reserve/shared/log"
)

func (uc *groupUseCase) CreateGroup(ctx context.Context, dto domain.CreateGroupDTO) (*domain.TrainingGroup, error) {
	ctx = log.WithFunctionCtx(ctx, "CreateGroup")

	group := &domain.TrainingGroup{
		BusinessID:        dto.BusinessID,
		CoachID:           dto.CoachID,
		Name:              dto.Name,
		Code:              dto.Code,
		Category:          dto.Category,
		Description:       dto.Description,
		MaxCapacity:       dto.MaxCapacity,
		CurrentCapacity:   0,
		AgeMin:            dto.AgeMin,
		AgeMax:            dto.AgeMax,
		SkillLevelID:      dto.SkillLevelID,
		RecurringSchedule: dto.RecurringSchedule,
		PhotoURL:          dto.PhotoURL,
		IsActive:          true,
	}

	created, err := uc.repo.Create(ctx, group)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error creando grupo de entrenamiento")
		return nil, err
	}

	uc.logger.Info(ctx).Msgf("Grupo de entrenamiento creado: %d", created.ID)
	return created, nil
}
