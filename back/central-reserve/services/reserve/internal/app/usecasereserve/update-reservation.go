package usecasereserve

import (
	"central_reserve/services/reserve/internal/domain"
	"context"
)

func (u *ReserveUseCase) UpdateReservation(ctx context.Context, params domain.UpdateReservationDTO) (string, error) {
	response, err := u.repository.UpdateReservation(ctx, params)
	if err != nil {
		return "", err
	}

	if response == "" {
		return "", nil // Reserva no encontrada
	}

	return response, nil
}
