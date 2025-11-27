package usecasereserve

import (
	"central_reserve/services/reserve/internal/domain"
	"context"
	"fmt"
)

// GetReserveByID obtiene una reserva por su ID
func (u *ReserveUseCase) GetReserveByID(ctx context.Context, id uint) (*domain.ReserveDetailDTO, error) {
	reservation, err := u.repository.GetReserveByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("error al obtener reserva: %w", err)
	}
	return reservation, nil
}
