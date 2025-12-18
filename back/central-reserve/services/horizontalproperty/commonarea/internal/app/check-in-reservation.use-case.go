package app

import (
	"context"
	"fmt"
	"time"

	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/secondary/repository"
	"central_reserve/shared/log"
	"dbpostgres/app/infra/models"
)

// CheckInReservation registra el check-in de una reserva
func (uc *commonAreaUseCase) CheckInReservation(ctx context.Context, reservationID uint, userID uint) (*domain.CommonAreaReservation, error) {
	ctx = log.WithFunctionCtx(ctx, "CheckInReservation")

	// Obtener reserva
	reservation, err := uc.reservationRepo.GetReservationByID(ctx, reservationID)
	if err != nil {
		return nil, err
	}

	// Obtener modelo para cambiar estado
	reservationRepo, ok := uc.reservationRepo.(*repository.CommonAreaReservationRepository)
	if !ok {
		return nil, fmt.Errorf("repositorio de reservas no es del tipo esperado")
	}

	var reservationModel models.CommonAreaReservation
	db := reservationRepo.GetDB(ctx)
	if err := db.First(&reservationModel, reservationID).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo reserva: %w", err)
	}

	// Cambiar estado a "checked_in"
	if err := domain.ChangeReservationStatus(&reservationModel, "checked_in", db); err != nil {
		return nil, fmt.Errorf("error cambiando estado: %w", err)
	}

	// Actualizar campos de check-in
	now := time.Now()
	reservation.CheckedInByUserID = &userID
	reservation.CheckedInAt = &now
	reservation.ReservationStatusID = reservationModel.ReservationStatusID

	if err := uc.reservationRepo.UpdateReservation(ctx, reservation); err != nil {
		return nil, err
	}

	uc.logger.Info(ctx).Uint("reservation_id", reservationID).Uint("user_id", userID).Msg("Check-in registrado")

	// Recargar reserva actualizada
	return uc.reservationRepo.GetReservationByID(ctx, reservationID)
}
