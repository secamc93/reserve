package app

import (
	"context"

	"central_reserve/services/sporttraining/booking/internal/domain"
	"central_reserve/shared/log"
)

func (uc *bookingUseCase) ListBookings(ctx context.Context, filters domain.BookingFiltersDTO) (*domain.PaginatedBookingsDTO, error) {
	ctx = log.WithFunctionCtx(ctx, "ListBookings")

	if filters.Page < 1 {
		filters.Page = 1
	}
	if filters.PageSize < 1 {
		filters.PageSize = 10
	}
	if filters.PageSize > 100 {
		filters.PageSize = 100
	}

	result, err := uc.repo.List(ctx, filters)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error listando reservas")
		return nil, err
	}

	return result, nil
}
