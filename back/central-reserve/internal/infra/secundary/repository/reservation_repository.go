package repository

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/domain/entities"
	"central_reserve/internal/infra/secundary/repository/mapper"
	"context"
	"dbpostgres/app/infra/models"
	"fmt"
	"time"
)

// CreateReserve crea una nueva reserva
func (r *Repository) CreateReserve(ctx context.Context, reserve entities.Reservation) (string, error) {
	// Mapear de entities.Reservation a models.Reservation
	gormReservation := mapper.EntityToReservation(reserve)

	if err := r.database.Conn(ctx).Create(&gormReservation).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al crear reserva")
		return "", err
	}
	return fmt.Sprintf("Reserva creada con ID: %d", gormReservation.ID), nil
}

// GetLatestReservationByClient obtiene la última reserva de un cliente
func (r *Repository) GetLatestReservationByClient(ctx context.Context, clientID uint) (*entities.Reservation, error) {
	var gormReservation models.Reservation
	if err := r.database.Conn(ctx).Where("client_id = ?", clientID).Order("created_at DESC").First(&gormReservation).Error; err != nil {
		r.logger.Error().Uint("client_id", clientID).Msg("Error al obtener última reserva del cliente")
		return nil, err
	}

	// Mapear de models.Reservation a entities.Reservation
	reservation := mapper.ReservationToEntity(gormReservation)
	return &reservation, nil
}

// GetReserves obtiene las reservas con filtros opcionales
func (r *Repository) GetReserves(ctx context.Context, statusID *uint, clientID *uint, tableID *uint, startDate *time.Time, endDate *time.Time) ([]dtos.ReserveDetailDTO, error) {
	var gormReservations []models.Reservation

	query := r.database.Conn(ctx).Preload("Status").Preload("Client").Preload("Table").Preload("Business").Preload("CreatedBy")

	// Aplicar filtros
	if statusID != nil {
		query = query.Where("status_id = ?", *statusID)
	}
	if clientID != nil {
		query = query.Where("client_id = ?", *clientID)
	}
	if tableID != nil {
		query = query.Where("table_id = ?", *tableID)
	}
	if startDate != nil {
		query = query.Where("start_at >= ?", *startDate)
	}
	if endDate != nil {
		query = query.Where("end_at <= ?", *endDate)
	}

	if err := query.Find(&gormReservations).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al obtener reservas")
		return []dtos.ReserveDetailDTO{}, nil
	}

	// Mapear a DTOs
	var results []dtos.ReserveDetailDTO
	for _, reservation := range gormReservations {
		dto := dtos.ReserveDetailDTO{
			ReservaID:          reservation.ID,
			StartAt:            reservation.StartAt,
			EndAt:              reservation.EndAt,
			NumberOfGuests:     reservation.NumberOfGuests,
			ReservaCreada:      reservation.CreatedAt,
			ReservaActualizada: reservation.UpdatedAt,
			EstadoCodigo:       reservation.Status.Code,
			EstadoNombre:       reservation.Status.Name,
			ClienteID:          reservation.Client.ID,
			ClienteNombre:      reservation.Client.Name,
			ClienteEmail:       reservation.Client.Email,
			ClienteTelefono:    reservation.Client.Phone,
			ClienteDni:         reservation.Client.Dni,
			MesaID:             &reservation.Table.ID,
			MesaNumero:         &reservation.Table.Number,
			MesaCapacidad:      &reservation.Table.Capacity,
			NegocioID:          reservation.Business.ID,
			NegocioNombre:      reservation.Business.Name,
			NegocioCodigo:      reservation.Business.Code,
			NegocioDireccion:   reservation.Business.Address,
			UsuarioID:          &reservation.CreatedBy.ID,
			UsuarioNombre:      &reservation.CreatedBy.Name,
			UsuarioEmail:       &reservation.CreatedBy.Email,
			StatusHistory:      []entities.ReservationStatusHistory{},
		}
		results = append(results, dto)
	}

	// Obtener el historial de estados para cada reserva
	if len(results) > 0 {
		reservationIDs := make([]uint, len(results))
		for i, result := range results {
			reservationIDs[i] = result.ReservaID
		}

		var historyResults []models.ReservationStatusHistory
		if err := r.database.Conn(ctx).
			Preload("Status").Preload("ChangedBy").
			Where("reservation_id IN ?", reservationIDs).
			Order("created_at ASC").
			Find(&historyResults).Error; err != nil {
			r.logger.Error().Err(err).Msg("Error al obtener historial de estados")
		} else {
			// Agrupar historial por reservation_id
			historyMap := make(map[uint][]entities.ReservationStatusHistory)
			for _, history := range historyResults {
				entityHistory := mapper.ReservationStatusHistoryToEntity(history)
				historyMap[history.ReservationID] = append(historyMap[history.ReservationID], entityHistory)
			}

			// Asignar historial a cada reserva
			for i := range results {
				if history, exists := historyMap[results[i].ReservaID]; exists {
					results[i].StatusHistory = history
				}
			}
		}
	}

	return results, nil
}

// GetReserveByID obtiene una reserva por su ID
func (r *Repository) GetReserveByID(ctx context.Context, id uint) (*dtos.ReserveDetailDTO, error) {
	var gormReservation models.Reservation

	err := r.database.Conn(ctx).
		Preload("Status").Preload("Client").Preload("Table").Preload("Business").Preload("CreatedBy").
		Where("id = ?", id).
		First(&gormReservation).Error

	if err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al obtener reserva por ID")
		return nil, err
	}

	// Mapear a DTO
	result := dtos.ReserveDetailDTO{
		ReservaID:          gormReservation.ID,
		StartAt:            gormReservation.StartAt,
		EndAt:              gormReservation.EndAt,
		NumberOfGuests:     gormReservation.NumberOfGuests,
		ReservaCreada:      gormReservation.CreatedAt,
		ReservaActualizada: gormReservation.UpdatedAt,
		EstadoCodigo:       gormReservation.Status.Code,
		EstadoNombre:       gormReservation.Status.Name,
		ClienteID:          gormReservation.Client.ID,
		ClienteNombre:      gormReservation.Client.Name,
		ClienteEmail:       gormReservation.Client.Email,
		ClienteTelefono:    gormReservation.Client.Phone,
		ClienteDni:         gormReservation.Client.Dni,
		MesaID:             &gormReservation.Table.ID,
		MesaNumero:         &gormReservation.Table.Number,
		MesaCapacidad:      &gormReservation.Table.Capacity,
		NegocioID:          gormReservation.Business.ID,
		NegocioNombre:      gormReservation.Business.Name,
		NegocioCodigo:      gormReservation.Business.Code,
		NegocioDireccion:   gormReservation.Business.Address,
		UsuarioID:          &gormReservation.CreatedBy.ID,
		UsuarioNombre:      &gormReservation.CreatedBy.Name,
		UsuarioEmail:       &gormReservation.CreatedBy.Email,
		StatusHistory:      []entities.ReservationStatusHistory{},
	}

	// Obtener el historial de estados
	var historyResults []models.ReservationStatusHistory
	if err := r.database.Conn(ctx).
		Preload("Status").Preload("ChangedBy").
		Where("reservation_id = ?", id).
		Order("created_at ASC").
		Find(&historyResults).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al obtener historial de estados")
	} else {
		// Mapear historial a entities
		for _, history := range historyResults {
			entityHistory := mapper.ReservationStatusHistoryToEntity(history)
			result.StatusHistory = append(result.StatusHistory, entityHistory)
		}
	}

	return &result, nil
}

// CancelReservation cancela una reserva
func (r *Repository) CancelReservation(ctx context.Context, id uint, reason string) (string, error) {
	// Verificar que la reserva existe
	var existingReservation models.Reservation
	if err := r.database.Conn(ctx).Where("id = ?", id).First(&existingReservation).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al verificar reserva existente")
		return "", err
	}

	// Actualizar el estado de la reserva a cancelado (asumiendo que el ID del estado cancelado es 3)
	if err := r.database.Conn(ctx).Model(&models.Reservation{}).Where("id = ?", id).Update("status_id", 3).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al cancelar reserva")
		return "", err
	}

	// Crear registro en el historial
	history := models.ReservationStatusHistory{
		ReservationID: id,
		StatusID:      3, // Estado cancelado
	}

	if err := r.database.Conn(ctx).Create(&history).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al crear historial de cancelación")
		// No retornamos error aquí porque la reserva ya fue cancelada
	}

	return fmt.Sprintf("Reserva cancelada con ID: %d", id), nil
}

// UpdateReservation actualiza una reserva
func (r *Repository) UpdateReservation(ctx context.Context, id uint, tableID *uint, startAt *time.Time, endAt *time.Time, numberOfGuests *int) (string, error) {
	updates := make(map[string]interface{})

	if tableID != nil {
		updates["table_id"] = *tableID
	}
	if startAt != nil {
		updates["start_at"] = *startAt
	}
	if endAt != nil {
		updates["end_at"] = *endAt
	}
	if numberOfGuests != nil {
		updates["number_of_guests"] = *numberOfGuests
	}

	if len(updates) == 0 {
		return "No hay campos para actualizar", nil
	}

	if err := r.database.Conn(ctx).Model(&models.Reservation{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al actualizar reserva")
		return "", err
	}

	return fmt.Sprintf("Reserva actualizada con ID: %d", id), nil
}

// CreateReservationStatusHistory crea un registro en el historial de estados
func (r *Repository) CreateReservationStatusHistory(ctx context.Context, history entities.ReservationStatusHistory) error {
	gormHistory := mapper.EntityToReservationStatusHistory(history)

	if err := r.database.Conn(ctx).Create(&gormHistory).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al crear historial de estado")
		return err
	}

	return nil
}
