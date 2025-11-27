package usecasereserve

import (
	"central_reserve/services/reserve/internal/domain"
	"context"
)

// GetReservationStatuses obtiene todos los estados de reserva
func (u *ReserveUseCase) GetReservationStatuses(ctx context.Context) ([]domain.ReservationStatusDTO, error) {
	u.log.Info().Msg("Iniciando caso de uso: obtener estados de reserva")

	statuses, err := u.repository.GetReservationStatuses(ctx)
	if err != nil {
		u.log.Error().Err(err).Msg("Error al obtener estados de reserva desde el repositorio")
		return nil, err
	}

	dtoStatuses := make([]domain.ReservationStatusDTO, len(statuses))
	for i, status := range statuses {
		dtoStatuses[i] = domain.ReservationStatusDTO{
			ID:   status.ID,
			Code: status.Code,
			Name: status.Name,
		}
	}

	u.log.Info().Int("count", len(dtoStatuses)).Msg("Estados de reserva obtenidos exitosamente")
	return dtoStatuses, nil
}
