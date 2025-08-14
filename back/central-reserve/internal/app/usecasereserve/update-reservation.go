package usecasereserve

import (
	"central_reserve/internal/domain/dtos"
	"context"
)

func (u *ReserveUseCase) UpdateReservation(ctx context.Context, params dtos.UpdateReservationDTO) (string, error) {
	response, err := u.repository.UpdateReservation(ctx, params)
	if err != nil {
		return "", err
	}

	if response == "" {
		return "", nil // Reserva no encontrada
	}

	return response, nil
}
