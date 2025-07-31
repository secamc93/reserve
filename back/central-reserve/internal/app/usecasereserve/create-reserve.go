package usecasereserve

import (
	"central_reserve/internal/domain/entities"
	"context"
	"fmt"
)

// CreateReserve crea una nueva reserva
func (u *ReserveUseCase) CreateReserve(ctx context.Context, req entities.Reservation, name, email, phone string, dni string) (string, error) {
	u.log.Info().Str("email", email).Msg("Iniciando creación de reserva")

	// Verificar si el cliente ya existe
	existingClient, err := u.repository.GetClientByEmailAndBusiness(ctx, email, req.BusinessID)
	if err != nil && err.Error() != "record not found" {
		u.log.Error().Err(err).Str("email", email).Msg("Error al verificar cliente existente")
		return "", fmt.Errorf("error al verificar cliente: %w", err)
	}

	var clientID uint

	if existingClient != nil {
		// Cliente existe, usar su ID
		clientID = existingClient.ID
		u.log.Info().Uint("client_id", clientID).Str("email", email).Msg("Cliente existente encontrado")
	} else {
		// Crear nuevo cliente
		var dniPtr *string
		if dni != "" {
			dniPtr = &dni
		}

		newClient := entities.Client{
			Name:       name,
			Email:      email,
			Phone:      phone,
			Dni:        dniPtr,
			BusinessID: req.BusinessID,
		}

		_, err := u.repository.CreateClient(ctx, newClient)
		if err != nil {
			u.log.Error().Err(err).Str("email", email).Msg("Error al crear cliente")
			return "", fmt.Errorf("error al crear cliente: %w", err)
		}

		// Obtener el ID del cliente recién creado
		createdClient, err := u.repository.GetClientByEmailAndBusiness(ctx, email, req.BusinessID)
		if err != nil {
			u.log.Error().Err(err).Str("email", email).Msg("Error al obtener cliente recién creado")
			return "", fmt.Errorf("error al obtener cliente: %w", err)
		}
		clientID = createdClient.ID
		u.log.Info().Uint("client_id", clientID).Str("email", email).Msg("Nuevo cliente creado")
	}

	// Crear la reserva
	reservation := entities.Reservation{
		ClientID:       clientID,
		TableID:        req.TableID,
		BusinessID:     req.BusinessID,
		StartAt:        req.StartAt,
		EndAt:          req.EndAt,
		NumberOfGuests: req.NumberOfGuests,
		StatusID:       1, // Estado inicial: Pendiente
	}

	result, err := u.repository.CreateReserve(ctx, reservation)
	if err != nil {
		u.log.Error().Err(err).Uint("client_id", clientID).Msg("Error al crear reserva")
		return "", fmt.Errorf("error al crear reserva: %w", err)
	}

	// Crear historial de estado
	history := entities.ReservationStatusHistory{
		ReservationID: clientID, // Temporal, se actualizará después
		StatusID:      1,        // Estado inicial: Pendiente
	}

	if err := u.repository.CreateReservationStatusHistory(ctx, history); err != nil {
		u.log.Warn().Err(err).Msg("Error al crear historial de estado")
		// No retornamos error aquí porque la reserva ya fue creada
	}

	u.log.Info().Uint("client_id", clientID).Str("email", email).Msg("Reserva creada exitosamente")

	// Enviar email de confirmación
	if err := u.emailService.SendReservationConfirmation(ctx, email, name, reservation); err != nil {
		u.log.Warn().Err(err).Str("email", email).Msg("Error al enviar email de confirmación")
		// No retornamos error aquí porque la reserva ya fue creada exitosamente
	} else {
		u.log.Info().Str("email", email).Msg("Email de confirmación enviado exitosamente")
	}

	return result, nil
}
