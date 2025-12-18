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

// CheckOutReservation registra el check-out de una reserva
func (uc *commonAreaUseCase) CheckOutReservation(ctx context.Context, reservationID uint, userID uint) (*domain.CommonAreaReservation, error) {
	ctx = log.WithFunctionCtx(ctx, "CheckOutReservation")

	// Obtener reserva
	reservation, err := uc.reservationRepo.GetReservationByID(ctx, reservationID)
	if err != nil {
		return nil, err
	}

	// Validar que tenga check-in previo
	if reservation.CheckedInAt == nil {
		return nil, fmt.Errorf("la reserva no tiene check-in registrado")
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

	// Cambiar estado a "checked_out"
	if err := domain.ChangeReservationStatus(&reservationModel, "checked_out", db); err != nil {
		return nil, fmt.Errorf("error cambiando estado: %w", err)
	}

	// Actualizar campos de check-out
	now := time.Now()
	reservation.CheckedOutByUserID = &userID
	reservation.CheckedOutAt = &now
	reservation.ReservationStatusID = reservationModel.ReservationStatusID

	if err := uc.reservationRepo.UpdateReservation(ctx, reservation); err != nil {
		return nil, err
	}

	uc.logger.Info(ctx).Uint("reservation_id", reservationID).Uint("user_id", userID).Msg("Check-out registrado")

	// Recargar reserva actualizada
	return uc.reservationRepo.GetReservationByID(ctx, reservationID)
}
