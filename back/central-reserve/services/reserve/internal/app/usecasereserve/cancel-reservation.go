package usecasereserve

import (
	"central_reserve/services/reserve/internal/domain"
	"context"
	"fmt"
)

// CancelReservation cancela una reserva existente
func (u *ReserveUseCase) CancelReservation(ctx context.Context, id uint, reason string) (string, error) {
	u.log.Info().Uint("reservation_id", id).Msg("Iniciando cancelación de reserva")

	// Obtener la reserva actual
	reservation, err := u.repository.GetReserveByID(ctx, id)
	if err != nil {
		u.log.Error().Err(err).Uint("reservation_id", id).Msg("Error al obtener reserva")
		return "", fmt.Errorf("error al obtener reserva: %w", err)
	}

	if reservation == nil {
		u.log.Error().Uint("reservation_id", id).Msg("Reserva no encontrada")
		return "", fmt.Errorf("reserva no encontrada")
	}

	// Convertir DTO a entidad para la cancelación
	reservationEntity := u.convertDTOToReservation(reservation)

	// Cancelar la reserva
	result, err := u.repository.CancelReservation(ctx, id, reason)
	if err != nil {
		u.log.Error().Err(err).Uint("reservation_id", id).Msg("Error al cancelar reserva")
		return "", fmt.Errorf("error al cancelar reserva: %w", err)
	}

	// Enviar email de cancelación (en background)
	go func() {
		if err := u.SendReservationCancellation(ctx, reservation.ClienteEmail, reservation.ClienteNombre, reservationEntity); err != nil {
			u.log.Error().Err(err).Str("email", reservation.ClienteEmail).Msg("Error enviando email de cancelación")
		} else {
			u.log.Info().Str("email", reservation.ClienteEmail).Msg("Email de cancelación enviado exitosamente")
		}
	}()

	u.log.Info().Uint("reservation_id", id).Msg("Reserva cancelada exitosamente")

	return result, nil
}

// convertDTOToReservation convierte un DTO de reserva a entidad
func (u *ReserveUseCase) convertDTOToReservation(dto *domain.ReserveDetailDTO) domain.Reservation {
	return domain.Reservation{
		ID:             dto.ReservaID,
		BusinessID:     dto.NegocioID,
		TableID:        dto.MesaID,
		ClientID:       dto.ClienteID,
		StartAt:        dto.StartAt,
		EndAt:          dto.EndAt,
		NumberOfGuests: dto.NumberOfGuests,
		StatusID:       0, // No es relevante para el email
	}
}
