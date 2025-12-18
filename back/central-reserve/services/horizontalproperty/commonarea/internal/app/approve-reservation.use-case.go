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

// ApproveReservation aprueba una reserva pendiente
func (uc *commonAreaUseCase) ApproveReservation(ctx context.Context, reservationID uint, userID uint) (*domain.CommonAreaReservation, error) {
	ctx = log.WithFunctionCtx(ctx, "ApproveReservation")

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

	// Cambiar estado a "approved"
	if err := domain.ChangeReservationStatus(&reservationModel, "approved", db); err != nil {
		return nil, fmt.Errorf("error cambiando estado: %w", err)
	}

	// Actualizar campos de aprobación
	now := time.Now()
	reservation.ApprovedByUserID = &userID
	reservation.ApprovedAt = &now
	reservation.ReservationStatusID = reservationModel.ReservationStatusID

	if err := uc.reservationRepo.UpdateReservation(ctx, reservation); err != nil {
		return nil, err
	}

	uc.logger.Info(ctx).Uint("reservation_id", reservationID).Uint("user_id", userID).Msg("Reserva aprobada exitosamente")

	// Recargar reserva actualizada
	return uc.reservationRepo.GetReservationByID(ctx, reservationID)
}
