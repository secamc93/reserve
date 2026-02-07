package app

import (
	"context"

	"central_reserve/services/sporttraining/session/internal/domain"
	"central_reserve/shared/log"
)

func (uc *sessionUseCase) CreateSession(ctx context.Context, dto domain.CreateSessionDTO) (*domain.TrainingSession, error) {
	ctx = log.WithFunctionCtx(ctx, "CreateSession")

	// Validaciones
	if dto.EndTime.Before(dto.StartTime) || dto.EndTime.Equal(dto.StartTime) {
		return nil, domain.ErrInvalidSessionDates
	}

	if dto.SessionMode != "individual" && dto.SessionMode != "group" {
		return nil, domain.ErrInvalidSessionMode
	}

	session := &domain.TrainingSession{
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
		CurrentParticipants:   0,
		Price:                 dto.Price,
		Status:                "scheduled",
		IsRecurring:           dto.IsRecurring,
		CoachNotes:            dto.CoachNotes,
		PublicNotes:           dto.PublicNotes,
	}

	created, err := uc.repo.Create(ctx, session)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error creando sesión")
		return nil, err
	}

	uc.logger.Info(ctx).Msgf("Sesión creada: %d", created.ID)
	return created, nil
}
