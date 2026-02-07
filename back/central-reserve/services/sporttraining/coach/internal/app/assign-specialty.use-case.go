package app

import (
	"context"

	"central_reserve/services/sporttraining/coach/internal/domain"
	"central_reserve/shared/log"
)

func (uc *coachUseCase) AssignSpecialty(ctx context.Context, dto domain.AssignSpecialtyDTO) error {
	ctx = log.WithFunctionCtx(ctx, "AssignSpecialty")

	// Validar nivel de competencia
	if dto.ProficiencyLevel < 1 || dto.ProficiencyLevel > 5 {
		uc.logger.Error(ctx).Msgf("Nivel de competencia inválido: %d", dto.ProficiencyLevel)
		return domain.ErrInvalidProficiencyLevel
	}

	err := uc.repo.AssignSpecialty(ctx, dto)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error asignando especialidad")
		return err
	}

	uc.logger.Info(ctx).Msgf("Especialidad %d asignada al entrenador %d", dto.SpecialtyID, dto.CoachID)
	return nil
}
