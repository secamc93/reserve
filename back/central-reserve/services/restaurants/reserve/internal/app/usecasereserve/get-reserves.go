package usecasereserve

import (
	"central_reserve/services/reserve/internal/domain"
	"context"
	"time"
)

// GetReserves obtiene las reservas con filtros opcionales
func (u *ReserveUseCase) GetReserves(ctx context.Context, statusID *uint, clientID *uint, tableID *uint, startDate *time.Time, endDate *time.Time) ([]domain.ReserveDetailDTO, error) {
	reserves, err := u.repository.GetReserves(ctx, statusID, clientID, tableID, startDate, endDate)
	if err != nil {
		return nil, err
	}
	return reserves, nil
}
