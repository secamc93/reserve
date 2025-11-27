package usecasereserve

import (
	"central_reserve/services/reserve/internal/domain"
	"context"
	"fmt"
)

// CreateReserve crea una nueva reserva
func (u *ReserveUseCase) CreateReserve(ctx context.Context, req domain.Reservation, name, email, phone string, dni string) (*domain.ReserveDetailDTO, error) {
	u.log.Info().Str("email", email).Msg("Iniciando creación de reserva")

	// ✅ VERIFICAR: Log para confirmar que el EmailService está inyectado
	if u.sender == nil {
		u.log.Error().Msg("❌ EmailService es nil - no se inyectó correctamente")
	} else {
		u.log.Info().Msg("✅ EmailService inyectado correctamente")
	}

	// Verificar si el cliente ya existe
	existingClient, err := u.repository.GetClientByEmailAndBusiness(ctx, email, req.BusinessID)
	if err != nil && err.Error() != "record not found" {
		u.log.Error().Err(err).Str("email", email).Msg("Error al verificar cliente existente")
		return nil, fmt.Errorf("error al verificar cliente: %w", err)
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

		newClient := domain.Client{
			Name:       name,
			Email:      email,
			Phone:      phone,
			Dni:        dniPtr,
			BusinessID: req.BusinessID,
		}

		_, err := u.repository.CreateClient(ctx, newClient)
		if err != nil {
			u.log.Error().Err(err).Str("email", email).Msg("Error al crear cliente")
			return nil, fmt.Errorf("error al crear cliente: %w", err)
		}

		// Obtener el ID del cliente recién creado
		createdClient, err := u.repository.GetClientByEmailAndBusiness(ctx, email, req.BusinessID)
		if err != nil {
			u.log.Error().Err(err).Str("email", email).Msg("Error al obtener cliente recién creado")
			return nil, fmt.Errorf("error al obtener cliente: %w", err)
		}
		clientID = createdClient.ID
		u.log.Info().Uint("client_id", clientID).Str("email", email).Msg("Nuevo cliente creado")
	}

	// Crear la reserva
	reservation := domain.Reservation{
		ClientID:       clientID,
		TableID:        req.TableID,
		BusinessID:     req.BusinessID,
		StartAt:        req.StartAt,
		EndAt:          req.EndAt,
		NumberOfGuests: req.NumberOfGuests,
		StatusID:       1, // Estado inicial: Pendiente
	}

	reservationID, err := u.repository.CreateReserve(ctx, reservation)
	if err != nil {
		u.log.Error().Err(err).Uint("client_id", clientID).Msg("Error al crear reserva")
		return nil, fmt.Errorf("error al crear reserva: %w", err)
	}

	// Crear historial de estado
	history := domain.ReservationStatusHistory{
		ReservationID: clientID,
		StatusID:      1,
	}

	if err := u.repository.CreateReservationStatusHistory(ctx, history); err != nil {
		u.log.Warn().Err(err).Msg("Error al crear historial de estado")
	}

	// ✅ NUEVO: Obtener la reserva completa con todos los datos relacionados
	completeReservation, err := u.repository.GetReserveByID(ctx, reservationID)
	if err != nil {
		u.log.Error().Err(err).Uint("reservation_id", reservationID).Msg("Error al obtener reserva completa")
		return nil, fmt.Errorf("error al obtener reserva completa: %w", err)
	}

	u.log.Info().Uint("client_id", clientID).Str("email", email).Msg("Reserva creada exitosamente")

	// ✅ OPTIMIZADO: Enviar email de confirmación de forma asíncrona (en background)
	go func() {
		reservationWithID := domain.Reservation{
			ID:             reservationID,
			ClientID:       clientID,
			TableID:        req.TableID,
			BusinessID:     req.BusinessID,
			StartAt:        req.StartAt,
			EndAt:          req.EndAt,
			NumberOfGuests: req.NumberOfGuests,
			StatusID:       1,
		}

		if err := u.SendReservationConfirmation(ctx, email, name, reservationWithID); err != nil {
			u.log.Warn().Err(err).Str("email", email).Msg("Error al enviar email de confirmación")
		} else {
			u.log.Info().Str("email", email).Msg("Email de confirmación enviado exitosamente")
		}
	}()

	return completeReservation, nil
}
