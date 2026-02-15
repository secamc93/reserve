package app

import (
	"context"

	"central_reserve/services/sporttraining/session/internal/domain"
	"central_reserve/shared/log"
)

func (uc *sessionUseCase) UpdateSession(ctx context.Context, dto domain.UpdateSessionDTO) (*domain.TrainingSession, error) {
	ctx = log.WithFunctionCtx(ctx, "UpdateSession")

	// Validaciones
	if dto.EndTime.Before(dto.StartTime) || dto.EndTime.Equal(dto.StartTime) {
		return nil, domain.ErrInvalidSessionDates
	}

	if dto.SessionMode != "individual" && dto.SessionMode != "group" {
		return nil, domain.ErrInvalidSessionMode
	}

	session := &domain.TrainingSession{
		ID:                    dto.ID,
		BusinessID:            dto.BusinessID,
		TrainingSessionTypeID: dto.TrainingSessionTypeID,
		CoachID:               dto.CoachID,
		TrainingGroupID:       dto.TrainingGroupID,
		SessionMode:           dto.SessionMode,
		ScheduledDate:         dto.ScheduledDate,
		StartTime:             dto.StartTime,
		EndTime:               dto.EndTime,
		Duration:              dto.Duration,
		Location:              dto.Location,
		Field:                 dto.Field,
		MaxParticipants:       dto.MaxParticipants,
		Price:                 dto.Price,
		IsRecurring:           dto.IsRecurring,
		CoachNotes:            dto.CoachNotes,
		PublicNotes:           dto.PublicNotes,
	}

	updated, err := uc.repo.Update(ctx, session)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msgf("Error actualizando sesión %d", dto.ID)
		return nil, err
	}

	uc.logger.Info(ctx).Msgf("Sesión actualizada: %d", updated.ID)
	return updated, nil
}
