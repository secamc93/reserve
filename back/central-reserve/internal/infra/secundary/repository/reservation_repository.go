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
func (r *Repository) CreateReserve(ctx context.Context, reserve entities.Reservation) (uint, error) {
	// Mapear de entities.Reservation a models.Reservation
	gormReservation := mapper.EntityToReservation(reserve)

	if err := r.database.Conn(ctx).Create(&gormReservation).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al crear reserva")
		return 0, err
	}
	return gormReservation.ID, nil
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

	if len(gormReservations) == 0 {
		r.logger.Info().Msg("No se encontraron reservas en la base de datos")
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
		}

		// Manejar relaciones de forma segura
		if reservation.Status.ID != 0 {
			dto.EstadoCodigo = reservation.Status.Code
			dto.EstadoNombre = reservation.Status.Name
		}

		if reservation.Client.ID != 0 {
			dto.ClienteID = reservation.Client.ID
			dto.ClienteNombre = reservation.Client.Name
			dto.ClienteEmail = reservation.Client.Email
			dto.ClienteTelefono = reservation.Client.Phone
			dto.ClienteDni = reservation.Client.Dni
		}

		if reservation.Table.ID != 0 {
			dto.MesaID = &reservation.Table.ID
			dto.MesaNumero = &reservation.Table.Number
			dto.MesaCapacidad = &reservation.Table.Capacity
		}

		if reservation.Business.ID != 0 {
			dto.NegocioID = reservation.Business.ID
			dto.NegocioNombre = reservation.Business.Name
			dto.NegocioCodigo = reservation.Business.Code
			dto.NegocioDireccion = reservation.Business.Address
		}

		if reservation.CreatedBy.ID != 0 {
			dto.UsuarioID = &reservation.CreatedBy.ID
			dto.UsuarioNombre = &reservation.CreatedBy.Name
			dto.UsuarioEmail = &reservation.CreatedBy.Email
		}

		results = append(results, dto)
	}

	r.logger.Info().Int("total_results", len(results)).Msg("Reservas mapeadas exitosamente")
	return results, nil
}

// GetReservesCount obtiene el número total de reservas (para debugging)
func (r *Repository) GetReservesCount(ctx context.Context) (int64, error) {
	var count int64
	err := r.database.Conn(ctx).Model(&models.Reservation{}).Count(&count).Error
	if err != nil {
		r.logger.Error().Err(err).Msg("Error al contar reservas")
		return 0, err
	}
	r.logger.Info().Int64("count", count).Msg("Total de reservas en la base de datos")
	return count, nil
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
func (r *Repository) UpdateReservation(ctx context.Context, params dtos.UpdateReservationDTO) (string, error) {
	updates := make(map[string]interface{})

	if params.TableID != nil {
		updates["table_id"] = *params.TableID
	}
	if params.StartAt != nil {
		updates["start_at"] = *params.StartAt
	}
	if params.EndAt != nil {
		updates["end_at"] = *params.EndAt
	}
	if params.NumberOfGuests != nil {
		updates["number_of_guests"] = *params.NumberOfGuests
	}
	if params.StatusID != nil {
		updates["status_id"] = *params.StatusID
	}

	if len(updates) == 0 {
		return "No hay campos para actualizar", nil
	}

	if err := r.database.Conn(ctx).Model(&models.Reservation{}).Where("id = ?", params.ID).Updates(updates).Error; err != nil {
		r.logger.Error().Uint("id", params.ID).Err(err).Msg("Error al actualizar reserva")
		return "", err
	}

	if params.StatusID != nil {
		history := models.ReservationStatusHistory{
			ReservationID: params.ID,
			StatusID:      *params.StatusID,
		}
		if err := r.database.Conn(ctx).Create(&history).Error; err != nil {
			r.logger.Error().Uint("id", params.ID).Err(err).Msg("Error al crear historial de estado")
		}
	}

	return fmt.Sprintf("Reserva actualizada con ID: %d", params.ID), nil
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
