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

// RejectReservation rechaza una reserva pendiente
func (uc *commonAreaUseCase) RejectReservation(ctx context.Context, reservationID uint, userID uint, reason string) (*domain.CommonAreaReservation, error) {
	ctx = log.WithFunctionCtx(ctx, "RejectReservation")

	if reason == "" {
		return nil, fmt.Errorf("la razón del rechazo es requerida")
	}

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

	// Cambiar estado a "rejected"
	if err := domain.ChangeReservationStatus(&reservationModel, "rejected", db); err != nil {
		return nil, fmt.Errorf("error cambiando estado: %w", err)
	}

	// Actualizar campos de rechazo
	now := time.Now()
	reservation.RejectedByUserID = &userID
	reservation.RejectedAt = &now
	reservation.RejectionReason = reason
	reservation.ReservationStatusID = reservationModel.ReservationStatusID

	if err := uc.reservationRepo.UpdateReservation(ctx, reservation); err != nil {
		return nil, err
	}

	uc.logger.Info(ctx).Uint("reservation_id", reservationID).Uint("user_id", userID).Msg("Reserva rechazada")

	// Recargar reserva actualizada
	return uc.reservationRepo.GetReservationByID(ctx, reservationID)
}
