package usecasereserve

import (
	"context"
)

func (u *ReserveUseCase) CancelReservation(ctx context.Context, id uint, reason string) (string, error) {
	response, err := u.repository.CancelReservation(ctx, id, reason)
	if err != nil {
		return "", err
	}

	if response == "" {
		return "", nil // Reserva no encontrada
	}

	return response, nil
}
