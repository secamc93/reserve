package usecasereserve

import (
	"context"
	"time"
)

func (u *ReserveUseCase) UpdateReservation(ctx context.Context, id uint, tableID *uint, startAt *time.Time, endAt *time.Time, numberOfGuests *int) (string, error) {
	response, err := u.repository.UpdateReservation(ctx, id, tableID, startAt, endAt, numberOfGuests)
	if err != nil {
		return "", err
	}

	if response == "" {
		return "", nil // Reserva no encontrada
	}

	return response, nil
}
