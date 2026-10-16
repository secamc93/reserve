package app

import (
	"context"
	"fmt"
	"regexp"

	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/shared/log"
)

var clockPattern = regexp.MustCompile(`^([01]\d|2[0-3]):[0-5]\d$`)

// GetSchedules devuelve el horario semanal de la zona (incluye días cerrados)
func (uc *commonAreaUseCase) GetSchedules(ctx context.Context, commonAreaID uint) ([]*domain.CommonAreaSchedule, error) {
	ctx = log.WithFunctionCtx(ctx, "GetSchedules")
	return uc.scheduleRepo.GetAllSchedulesByCommonAreaID(ctx, commonAreaID)
}

// SetSchedules guarda el horario semanal: actualiza el día si existe y lo crea si no.
// Un día con IsActive=false queda cerrado (no se borra: la tabla tiene índice único por día).
func (uc *commonAreaUseCase) SetSchedules(ctx context.Context, commonAreaID uint, schedules []domain.ScheduleInputDTO) ([]*domain.CommonAreaSchedule, error) {
	ctx = log.WithFunctionCtx(ctx, "SetSchedules")

	seen := map[int]bool{}
	for _, s := range schedules {
		if s.DayOfWeek < 0 || s.DayOfWeek > 6 {
			return nil, fmt.Errorf("%w: día %d fuera de rango (0-6)", domain.ErrInvalidSchedule, s.DayOfWeek)
		}
		if seen[s.DayOfWeek] {
			return nil, fmt.Errorf("%w: día %d repetido", domain.ErrInvalidSchedule, s.DayOfWeek)
		}
		seen[s.DayOfWeek] = true
		if !clockPattern.MatchString(s.StartTime) || !clockPattern.MatchString(s.EndTime) {
			return nil, fmt.Errorf("%w: las horas deben tener formato HH:MM", domain.ErrInvalidSchedule)
		}
		if s.IsActive && s.StartTime >= s.EndTime {
			return nil, fmt.Errorf("%w: la hora de inicio debe ser menor que la de fin", domain.ErrInvalidSchedule)
		}
	}

	if _, err := uc.commonAreaRepo.GetCommonAreaByID(ctx, commonAreaID); err != nil {
		return nil, err
	}

	existing, err := uc.scheduleRepo.GetAllSchedulesByCommonAreaID(ctx, commonAreaID)
	if err != nil {
		return nil, err
	}
	byDay := make(map[int]*domain.CommonAreaSchedule, len(existing))
	for _, e := range existing {
		byDay[e.DayOfWeek] = e
	}

	for _, s := range schedules {
		if current, ok := byDay[s.DayOfWeek]; ok {
			current.StartTime = s.StartTime
			current.EndTime = s.EndTime
			current.IsActive = s.IsActive
			if err := uc.scheduleRepo.UpdateSchedule(ctx, current); err != nil {
				return nil, err
			}
			continue
		}
		if _, err := uc.scheduleRepo.CreateSchedule(ctx, &domain.CommonAreaSchedule{
			CommonAreaID: commonAreaID,
			DayOfWeek:    s.DayOfWeek,
			StartTime:    s.StartTime,
			EndTime:      s.EndTime,
			IsActive:     s.IsActive,
		}); err != nil {
			return nil, err
		}
	}

	uc.logger.Info(ctx).Uint("common_area_id", commonAreaID).Int("days", len(schedules)).Msg("Horario semanal guardado")
	return uc.scheduleRepo.GetAllSchedulesByCommonAreaID(ctx, commonAreaID)
}
