package mapper

import (
	"central_reserve/internal/domain/entities"
	"dbpostgres/app/infra/models"
)

// ReservationToEntity convierte models.Reservation a entities.Reservation
func ReservationToEntity(reservation models.Reservation) entities.Reservation {
	return entities.Reservation{
		Id:              reservation.ID,
		BusinessID:      reservation.BusinessID,
		TableID:         reservation.TableID,
		ClientID:        reservation.ClientID,
		CreatedByUserID: reservation.CreatedByUserID,
		StartAt:         reservation.StartAt,
		EndAt:           reservation.EndAt,
		NumberOfGuests:  reservation.NumberOfGuests,
		StatusID:        reservation.StatusID,
		CreatedAt:       reservation.CreatedAt,
		UpdatedAt:       reservation.UpdatedAt,
	}
}

// EntityToReservation convierte entities.Reservation a models.Reservation
func EntityToReservation(reservation entities.Reservation) models.Reservation {
	return models.Reservation{
		BusinessID:      reservation.BusinessID,
		TableID:         reservation.TableID,
		ClientID:        reservation.ClientID,
		CreatedByUserID: reservation.CreatedByUserID,
		StartAt:         reservation.StartAt,
		EndAt:           reservation.EndAt,
		NumberOfGuests:  reservation.NumberOfGuests,
		StatusID:        reservation.StatusID,
	}
}

// ReservationSliceToEntitySlice convierte []models.Reservation a []entities.Reservation
func ReservationSliceToEntitySlice(reservations []models.Reservation) []entities.Reservation {
	result := make([]entities.Reservation, len(reservations))
	for i, reservation := range reservations {
		result[i] = ReservationToEntity(reservation)
	}
	return result
}

// ReservationStatusHistoryToEntity convierte models.ReservationStatusHistory a entities.ReservationStatusHistory
func ReservationStatusHistoryToEntity(history models.ReservationStatusHistory) entities.ReservationStatusHistory {
	return entities.ReservationStatusHistory{
		ID:              history.ID,
		ReservationID:   history.ReservationID,
		StatusID:        history.StatusID,
		ChangedByUserID: history.ChangedByUserID,
		CreatedAt:       history.CreatedAt,
		UpdatedAt:       history.UpdatedAt,
	}
}

// EntityToReservationStatusHistory convierte entities.ReservationStatusHistory a models.ReservationStatusHistory
func EntityToReservationStatusHistory(history entities.ReservationStatusHistory) models.ReservationStatusHistory {
	return models.ReservationStatusHistory{
		ReservationID:   history.ReservationID,
		StatusID:        history.StatusID,
		ChangedByUserID: history.ChangedByUserID,
	}
}

// ReservationStatusHistorySliceToEntitySlice convierte []models.ReservationStatusHistory a []entities.ReservationStatusHistory
func ReservationStatusHistorySliceToEntitySlice(histories []models.ReservationStatusHistory) []entities.ReservationStatusHistory {
	result := make([]entities.ReservationStatusHistory, len(histories))
	for i, history := range histories {
		result[i] = ReservationStatusHistoryToEntity(history)
	}
	return result
}
