package mappers

import (
	"central_reserve/services/reserve/internal/domain"
	"dbpostgres/app/infra/models"
	"time"
)

// ReservationToEntity convierte models.Reservation a entities.Reservation
func ReservationToEntity(reservation models.Reservation) domain.Reservation {
	return domain.Reservation{
		ID:              reservation.Model.ID,
		BusinessID:      reservation.BusinessID,
		TableID:         reservation.TableID,
		ClientID:        reservation.ClientID,
		CreatedByUserID: reservation.CreatedByUserID,
		StartAt:         reservation.StartAt,
		EndAt:           reservation.EndAt,
		NumberOfGuests:  reservation.NumberOfGuests,
		StatusID:        reservation.StatusID,
		CreatedAt:       reservation.Model.CreatedAt,
		UpdatedAt:       reservation.Model.UpdatedAt,
	}
}

// EntityToReservation convierte entities.Reservation a models.Reservation
func EntityToReservation(reservation domain.Reservation) models.Reservation {
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
func ReservationSliceToEntitySlice(reservations []models.Reservation) []domain.Reservation {
	result := make([]domain.Reservation, len(reservations))
	for i, reservation := range reservations {
		result[i] = ReservationToEntity(reservation)
	}
	return result
}

// ReservationStatusHistoryToEntity convierte models.ReservationStatusHistory a entities.ReservationStatusHistory
func ReservationStatusHistoryToEntity(history models.ReservationStatusHistory) domain.ReservationStatusHistory {
	return domain.ReservationStatusHistory{
		ID:              history.Model.ID,
		ReservationID:   history.ReservationID,
		StatusID:        history.StatusID,
		ChangedByUserID: history.ChangedByUserID,
		CreatedAt:       history.Model.CreatedAt,
		UpdatedAt:       history.Model.UpdatedAt,
	}
}

// EntityToReservationStatusHistory convierte entities.ReservationStatusHistory a models.ReservationStatusHistory
func EntityToReservationStatusHistory(history domain.ReservationStatusHistory) models.ReservationStatusHistory {
	return models.ReservationStatusHistory{
		ReservationID:   history.ReservationID,
		StatusID:        history.StatusID,
		ChangedByUserID: history.ChangedByUserID,
	}
}

// ReservationStatusHistorySliceToEntitySlice convierte []models.ReservationStatusHistory a []entities.ReservationStatusHistory
func ReservationStatusHistorySliceToEntitySlice(histories []models.ReservationStatusHistory) []domain.ReservationStatusHistory {
	result := make([]domain.ReservationStatusHistory, len(histories))
	for i, history := range histories {
		result[i] = ReservationStatusHistoryToEntity(history)
	}
	return result
}

// ReservationStatusToEntity convierte models.ReservationStatus a entities.ReservationStatus
func ReservationStatusToEntity(status models.ReservationStatus) domain.ReservationStatus {
	var deletedAt *time.Time
	if status.Model.DeletedAt.Valid {
		t := status.Model.DeletedAt.Time
		deletedAt = &t
	}
	return domain.ReservationStatus{
		ID:        status.Model.ID,
		Code:      status.Code,
		Name:      status.Name,
		CreatedAt: status.Model.CreatedAt,
		UpdatedAt: status.Model.UpdatedAt,
		DeletedAt: deletedAt,
	}
}

// ReservationStatusSliceToEntitySlice convierte []models.ReservationStatus a []entities.ReservationStatus
func ReservationStatusSliceToEntitySlice(statuses []models.ReservationStatus) []domain.ReservationStatus {
	result := make([]domain.ReservationStatus, len(statuses))
	for i, status := range statuses {
		result[i] = ReservationStatusToEntity(status)
	}
	return result
}

// CreateClientModel convierte entities.Client a models.Client
func CreateClientModel(client domain.Client) models.Client {
	return models.Client{
		Name:       client.Name,
		Email:      client.Email,
		Phone:      client.Phone,
		Dni:        client.Dni,
		BusinessID: client.BusinessID,
	}
}

// ToClientEntity convierte models.Client a entities.Client
func ToClientEntity(client models.Client) domain.Client {
	return domain.Client{
		ID:         client.Model.ID,
		Name:       client.Name,
		Email:      client.Email,
		Phone:      client.Phone,
		Dni:        client.Dni,
		BusinessID: client.BusinessID,
		CreatedAt:  client.Model.CreatedAt,
		UpdatedAt:  client.Model.UpdatedAt,
	}
}

// ToClientEntitySlice convierte []models.Client a []entities.Client
func ToClientEntitySlice(clients []models.Client) []domain.Client {
	var entities []domain.Client
	for _, client := range clients {
		entities = append(entities, ToClientEntity(client))
	}
	return entities
}
