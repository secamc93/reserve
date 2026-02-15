package mappers

import (
	"central_reserve/services/restaurants/reserve/internal/domain"
	"dbpostgres/app/infra/models"
)

// ReservationToDetailDTO convierte models.Reservation (con relaciones precargadas) a domain.ReserveDetailDTO
func ReservationToDetailDTO(reservation models.Reservation) domain.ReserveDetailDTO {
	dto := domain.ReserveDetailDTO{
		ReservaID:          reservation.Model.ID,
		StartAt:            reservation.StartAt,
		EndAt:              reservation.EndAt,
		NumberOfGuests:     reservation.NumberOfGuests,
		ReservaCreada:      reservation.Model.CreatedAt,
		ReservaActualizada: reservation.Model.UpdatedAt,
		EstadoID:           reservation.StatusID,
	}

	// Manejar relación Status
	if reservation.Status.Model.ID != 0 {
		dto.EstadoCodigo = reservation.Status.Code
		dto.EstadoNombre = reservation.Status.Name
	}

	// Manejar relación Client
	if reservation.Client.Model.ID != 0 {
		dto.ClienteID = reservation.Client.Model.ID
		dto.ClienteNombre = reservation.Client.Name
		dto.ClienteEmail = reservation.Client.Email
		dto.ClienteTelefono = reservation.Client.Phone
		dto.ClienteDni = reservation.Client.Dni
	}

	// Manejar relación Table
	if reservation.Table.Model.ID != 0 {
		dto.MesaID = &reservation.Table.Model.ID
		dto.MesaNumero = &reservation.Table.Number
		dto.MesaCapacidad = &reservation.Table.Capacity
	}

	// Manejar relación Business
	if reservation.Business.Model.ID != 0 {
		dto.NegocioID = reservation.Business.Model.ID
		dto.NegocioNombre = reservation.Business.Name
		dto.NegocioCodigo = reservation.Business.Code
		dto.NegocioDireccion = reservation.Business.Address
	}

	// Manejar relación CreatedBy (Usuario)
	if reservation.CreatedBy.Model.ID != 0 {
		dto.UsuarioID = &reservation.CreatedBy.Model.ID
		dto.UsuarioNombre = &reservation.CreatedBy.Name
		dto.UsuarioEmail = &reservation.CreatedBy.Email
	}

	return dto
}

// ReservationSliceToDetailDTOSlice convierte []models.Reservation a []domain.ReserveDetailDTO
func ReservationSliceToDetailDTOSlice(reservations []models.Reservation) []domain.ReserveDetailDTO {
	if len(reservations) == 0 {
		return []domain.ReserveDetailDTO{}
	}

	results := make([]domain.ReserveDetailDTO, len(reservations))
	for i, reservation := range reservations {
		results[i] = ReservationToDetailDTO(reservation)
	}

	return results
}
