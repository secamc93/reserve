package app

import (
	"context"

	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/shared/log"
)

// ListReservations lista reservas con filtros
func (uc *commonAreaUseCase) ListReservations(ctx context.Context, filters domain.ReservationFiltersDTO) (*domain.PaginatedReservationsDTO, error) {
	ctx = log.WithFunctionCtx(ctx, "ListReservations")

	result, err := uc.reservationRepo.ListReservations(ctx, filters)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error listando reservas")
		return nil, err
	}

	return result, nil
}
