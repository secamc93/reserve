package app

import (
	"context"

	"central_reserve/services/sporttraining/catalog/internal/domain"
	"central_reserve/shared/log"
)

func (uc *catalogUseCase) GetBookingStatuses(ctx context.Context) ([]domain.BookingStatus, error) {
	ctx = log.WithFunctionCtx(ctx, "GetBookingStatuses")

	statuses, err := uc.repo.GetBookingStatuses(ctx)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error obteniendo estados de reserva")
		return nil, err
	}

	return statuses, nil
}
