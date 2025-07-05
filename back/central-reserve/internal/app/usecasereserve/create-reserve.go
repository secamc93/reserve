package usecasereserve

import (
	"central_reserve/internal/domain"
	"context"
	"errors"
)

func (u *ReserveUseCase) CreateReserve(ctx context.Context, req domain.Reservation, name, email, phone string, dni uint) (string, error) {
	// 1. Buscar cliente por DNI
	client, err := u.repository.GetClientByDni(ctx, dni)
	var clientID uint
	if err == nil && client != nil {
		clientID = client.ID
	} else {
		// Crear cliente si no existe
		newClient := domain.Client{
			Name:         name,
			Email:        email,
			Phone:        phone,
			Dni:          dni,
			RestaurantID: req.RestaurantID,
		}
		_, err := u.repository.CreateClient(ctx, newClient)
		if err != nil {
			return "", errors.New("No se pudo crear el cliente")
		}
		// Buscar el cliente recién creado para obtener el ID
		client, err = u.repository.GetClientByDni(ctx, dni)
		if err != nil || client == nil {
			return "", errors.New("No se pudo obtener el cliente recién creado")
		}
		clientID = client.ID
	}

	// 2. Crear la reserva (sin mesa, statusId=1)
	reservation := domain.Reservation{
		RestaurantID:   req.RestaurantID,
		TableID:        nil,
		ClientID:       clientID,
		StartAt:        req.StartAt,
		EndAt:          req.EndAt,
		NumberOfGuests: req.NumberOfGuests,
		StatusID:       1,
	}
	response, err := u.repository.CreateReserve(ctx, reservation)
	if err != nil {
		return "", err
	}

	// Obtener el ID de la reserva recién creada
	// Buscar la última reserva del cliente
	var reservationID uint
	latestReservation, err := u.repository.GetLatestReservationByClient(ctx, clientID)
	if err == nil && latestReservation != nil {
		reservationID = latestReservation.Id
	}

	// 3. Crear registro en ReservationStatusHistory
	history := domain.ReservationStatusHistory{
		ReservationID: reservationID,
		StatusID:      1,
	}
	_ = u.repository.CreateReservationStatusHistory(ctx, history)

	return response, nil
}
