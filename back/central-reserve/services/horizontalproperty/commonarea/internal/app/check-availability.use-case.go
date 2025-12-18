package app

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/shared/log"
)

// CheckAvailability verifica si una zona está disponible en un horario específico
func (uc *commonAreaUseCase) CheckAvailability(ctx context.Context, dto domain.CheckAvailabilityDTO) (bool, error) {
	ctx = log.WithFunctionCtx(ctx, "CheckAvailability")

	// 1. Verificar que la zona común existe y está activa
	area, err := uc.commonAreaRepo.GetCommonAreaByID(ctx, dto.CommonAreaID)
	if err != nil {
		return false, err
	}
	if !area.IsActive {
		return false, fmt.Errorf("la zona común no está activa")
	}

	// 2. Verificar horario según schedule
	dayOfWeek := int(dto.ReservationDate.Weekday())
	schedule, err := uc.scheduleRepo.GetScheduleForDay(ctx, dto.CommonAreaID, dayOfWeek)
	if err != nil {
		return false, err
	}
	if schedule == nil {
		return false, domain.ErrScheduleNotConfigured
	}

	// Validar que el horario solicitado esté dentro del horario disponible
	if dto.StartTime < schedule.StartTime || dto.EndTime > schedule.EndTime {
		return false, fmt.Errorf("el horario solicitado está fuera del horario disponible (%s - %s)", schedule.StartTime, schedule.EndTime)
	}

	// 3. Verificar restricciones activas
	restrictions, err := uc.restrictionRepo.GetActiveRestrictions(ctx, dto.CommonAreaID, dto.ReservationDate, dto.StartTime, dto.EndTime)
	if err != nil {
		return false, err
	}
	if len(restrictions) > 0 {
		return false, domain.ErrRestrictionActive
	}

	// 4. Verificar solapamiento con otras reservas
	available, err := uc.reservationRepo.CheckAvailability(ctx, dto)
	if err != nil {
		return false, err
	}

	return available, nil
}
