package app

import (
	"context"
	"time"

	"central_reserve/services/sporttraining/attendance/internal/domain"
	"central_reserve/shared/log"
)

func (uc *attendanceUseCase) RecordAttendance(ctx context.Context, dto domain.CreateAttendanceDTO) (*domain.AttendanceRecord, error) {
	ctx = log.WithFunctionCtx(ctx, "RecordAttendance")

	// Crear entidad de dominio
	record := &domain.AttendanceRecord{
		TrainingSessionID:  dto.TrainingSessionID,
		PlayerID:           dto.PlayerID,
		AttendanceStatusID: dto.AttendanceStatusID,
		RecordedByCoachID:  dto.RecordedByCoachID,
		CheckInTime:        dto.CheckInTime,
		PerformanceRating:  dto.PerformanceRating,
		CoachFeedback:      dto.CoachFeedback,
		PlayerNotes:        dto.PlayerNotes,
		RecordedAt:         time.Now(),
	}

	// Crear registro
	createdRecord, err := uc.repo.Create(ctx, record)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error registrando asistencia")
		return nil, err
	}

	uc.logger.Info(ctx).
		Uint("session_id", dto.TrainingSessionID).
		Uint("player_id", dto.PlayerID).
		Msg("Asistencia registrada exitosamente")

	return createdRecord, nil
}
