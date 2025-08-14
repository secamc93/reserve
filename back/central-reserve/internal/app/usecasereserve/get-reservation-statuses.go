package usecasereserve

import (
	"central_reserve/internal/domain/dtos"
	"context"
)

// GetReservationStatuses obtiene todos los estados de reserva
func (u *ReserveUseCase) GetReservationStatuses(ctx context.Context) ([]dtos.ReservationStatusDTO, error) {
	u.log.Info().Msg("Iniciando caso de uso: obtener estados de reserva")

	statuses, err := u.repository.GetReservationStatuses(ctx)
	if err != nil {
		u.log.Error().Err(err).Msg("Error al obtener estados de reserva desde el repositorio")
		return nil, err
	}

	dtoStatuses := make([]dtos.ReservationStatusDTO, len(statuses))
	for i, status := range statuses {
		dtoStatuses[i] = dtos.ReservationStatusDTO{
			ID:   status.ID,
			Code: status.Code,
			Name: status.Name,
		}
	}

	u.log.Info().Int("count", len(dtoStatuses)).Msg("Estados de reserva obtenidos exitosamente")
	return dtoStatuses, nil
}
