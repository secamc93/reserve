package mapper

import (
	"central_reserve/internal/domain/entities"
	"dbpostgres/app/infra/models"
	"time"
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

// ReservationStatusToEntity convierte models.ReservationStatus a entities.ReservationStatus
func ReservationStatusToEntity(status models.ReservationStatus) entities.ReservationStatus {
	var deletedAt *time.Time
	if status.DeletedAt.Valid {
		t := status.DeletedAt.Time
		deletedAt = &t
	}
	return entities.ReservationStatus{
		ID:        status.ID,
		Code:      status.Code,
		Name:      status.Name,
		CreatedAt: status.CreatedAt,
		UpdatedAt: status.UpdatedAt,
		DeletedAt: deletedAt,
	}
}

// ReservationStatusSliceToEntitySlice convierte []models.ReservationStatus a []entities.ReservationStatus
func ReservationStatusSliceToEntitySlice(statuses []models.ReservationStatus) []entities.ReservationStatus {
	result := make([]entities.ReservationStatus, len(statuses))
	for i, status := range statuses {
		result[i] = ReservationStatusToEntity(status)
	}
	return result
}
