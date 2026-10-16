package app

import (
	"context"
	"fmt"
	"time"

	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/shared/log"
)

// ConfirmReservation confirma una reserva aprobada (genera QR y código de acceso);
// es el paso previo al check-in.
func (uc *commonAreaUseCase) ConfirmReservation(ctx context.Context, reservationID uint) (*domain.CommonAreaReservation, error) {
	ctx = log.WithFunctionCtx(ctx, "ConfirmReservation")

	if err := uc.reservationRepo.ChangeReservationStatus(ctx, reservationID, "confirmed"); err != nil {
		return nil, fmt.Errorf("error cambiando estado: %w", err)
	}
	uc.logger.Info(ctx).Uint("reservation_id", reservationID).Msg("Reserva confirmada")
	return uc.reservationRepo.GetReservationByID(ctx, reservationID)
}

// UpdateReservationPayments marca el depósito y/o el pago completo de una reserva
func (uc *commonAreaUseCase) UpdateReservationPayments(ctx context.Context, reservationID uint, dto domain.UpdatePaymentsDTO) (*domain.CommonAreaReservation, error) {
	ctx = log.WithFunctionCtx(ctx, "UpdateReservationPayments")

	if dto.DepositPaid == nil && dto.FullPaymentPaid == nil {
		return nil, fmt.Errorf("no hay cambios de pago")
	}

	reservation, err := uc.reservationRepo.GetReservationByID(ctx, reservationID)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	if dto.DepositPaid != nil && *dto.DepositPaid != reservation.DepositPaid {
		reservation.DepositPaid = *dto.DepositPaid
		if *dto.DepositPaid {
			reservation.DepositPaidAt = &now
		}
	}
	if dto.FullPaymentPaid != nil && *dto.FullPaymentPaid != reservation.FullPaymentPaid {
		reservation.FullPaymentPaid = *dto.FullPaymentPaid
		if *dto.FullPaymentPaid {
			reservation.FullPaymentPaidAt = &now
		}
	}

	if err := uc.reservationRepo.UpdateReservation(ctx, reservation); err != nil {
		return nil, err
	}
	uc.logger.Info(ctx).Uint("reservation_id", reservationID).Msg("Pagos de la reserva actualizados")
	return uc.reservationRepo.GetReservationByID(ctx, reservationID)
}

// SearchUnits busca unidades de la propiedad para asignarlas a una reserva
func (uc *commonAreaUseCase) SearchUnits(ctx context.Context, businessID uint, search string, limit int) ([]domain.UnitLookupDTO, error) {
	ctx = log.WithFunctionCtx(ctx, "SearchUnits")
	return uc.commonAreaRepo.SearchUnits(ctx, businessID, search, limit)
}
