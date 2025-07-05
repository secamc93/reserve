package repository

import (
	"central_reserve/internal/domain"
	"central_reserve/internal/infra/secundary/repository/db"
	"central_reserve/internal/pkg/log"
	"context"
	"time"
)

type Repository struct {
	database db.IDatabase
	logger   log.ILogger
}

func New(db db.IDatabase, logger log.ILogger) domain.IHolaMundo {
	return Repository{
		database: db,
		logger:   logger,
	}
}

func (r Repository) HolaMundo() string {
	return "Hola Mundo"
}

func (r Repository) CreateReserve(ctx context.Context, reserve domain.Reservation) (string, error) {
	if err := r.database.Conn(ctx).Table("reservation").Create(&reserve).Error; err != nil {
		r.logger.Error().Msg("Error al crear reserva")
		return "", err
	}
	return "Reserva creada exitosamente", nil
}

func (r Repository) GetClients(ctx context.Context) ([]domain.Client, error) {
	var clients []domain.Client
	if err := r.database.Conn(ctx).Table("client").Find(&clients).Error; err != nil {
		r.logger.Error().Msg("Error al obtener clientes")
		return nil, err
	}
	return clients, nil
}

func (r Repository) GetClientByID(ctx context.Context, id uint) (*domain.Client, error) {
	var client domain.Client
	if err := r.database.Conn(ctx).Table("client").Where("id = ?", id).First(&client).Error; err != nil {
		r.logger.Error().Msg("Error al obtener cliente por ID")
		return nil, err
	}
	return &client, nil
}

func (r Repository) GetClientByDni(ctx context.Context, dni uint) (*domain.Client, error) {
	var client domain.Client
	if err := r.database.Conn(ctx).Table("client").Where("dni = ?", dni).First(&client).Error; err != nil {
		r.logger.Error().Msg("Error al obtener cliente por DNI")
		return nil, err
	}
	return &client, nil
}

func (r Repository) CreateClient(ctx context.Context, client domain.Client) (string, error) {
	if err := r.database.Conn(ctx).Table("client").Create(&client).Error; err != nil {
		r.logger.Error().Msg("Error al crear cliente")
		return "", err
	}
	return "Cliente creado exitosamente", nil
}

func (r Repository) UpdateClient(ctx context.Context, id uint, client domain.Client) (string, error) {
	updates := make(map[string]interface{})
	if client.RestaurantID != 0 {
		updates["restaurant_id"] = client.RestaurantID
	}
	if client.Name != "" {
		updates["name"] = client.Name
	}
	if client.Email != "" {
		updates["email"] = client.Email
	}
	if client.Phone != "" {
		updates["phone"] = client.Phone
	}

	if len(updates) == 0 {
		return "No hay campos para actualizar", nil
	}

	result := r.database.Conn(ctx).Table("client").Where("id = ?", id).Updates(updates)
	if result.Error != nil {
		r.logger.Error().Msg("Error al actualizar cliente")
		return "", result.Error
	}

	if result.RowsAffected == 0 {
		return "", nil
	}

	return "Cliente actualizado exitosamente", nil
}

func (r Repository) DeleteClient(ctx context.Context, id uint) (string, error) {
	result := r.database.Conn(ctx).Table("client").Where("id = ?", id).Delete(nil)
	if result.Error != nil {
		r.logger.Error().Msg("Error al eliminar cliente")
		return "", result.Error
	}

	if result.RowsAffected == 0 {
		return "", nil
	}

	return "Cliente eliminado exitosamente", nil
}

func (r Repository) CreateTable(ctx context.Context, table domain.Table) (string, error) {
	if err := r.database.Conn(ctx).Table("table").Create(&table).Error; err != nil {
		r.logger.Error().Msg("Error al crear mesa")
		return "", err
	}
	return "Mesa creada exitosamente", nil
}

func (r Repository) GetTables(ctx context.Context) ([]domain.Table, error) {
	var tables []domain.Table
	if err := r.database.Conn(ctx).Table("table").Find(&tables).Error; err != nil {
		r.logger.Error().Msg("Error al obtener mesas")
		return nil, err
	}
	return tables, nil
}

func (r Repository) GetTableByID(ctx context.Context, id uint) (*domain.Table, error) {
	var table domain.Table
	if err := r.database.Conn(ctx).Table("table").Where("id = ?", id).First(&table).Error; err != nil {
		r.logger.Error().Msg("Error al obtener mesa por ID")
		return nil, err
	}
	return &table, nil
}

func (r Repository) UpdateTable(ctx context.Context, id uint, table domain.Table) (string, error) {
	updates := make(map[string]interface{})
	if table.RestaurantID != 0 {
		updates["restaurant_id"] = table.RestaurantID
	}
	if table.Number != 0 {
		updates["number"] = table.Number
	}
	if table.Capacity != 0 {
		updates["capacity"] = table.Capacity
	}

	if len(updates) == 0 {
		return "No hay campos para actualizar", nil
	}

	result := r.database.Conn(ctx).Table("table").Where("id = ?", id).Updates(updates)
	if result.Error != nil {
		r.logger.Error().Msg("Error al actualizar mesa")
		return "", result.Error
	}

	if result.RowsAffected == 0 {
		return "", nil
	}

	return "Mesa actualizada exitosamente", nil
}

func (r Repository) DeleteTable(ctx context.Context, id uint) (string, error) {
	result := r.database.Conn(ctx).Table("table").Where("id = ?", id).Delete(nil)
	if result.Error != nil {
		r.logger.Error().Msg("Error al eliminar mesa")
		return "", result.Error
	}

	if result.RowsAffected == 0 {
		return "", nil
	}

	return "Mesa eliminada exitosamente", nil
}

func (r Repository) CreateReservationStatusHistory(ctx context.Context, history domain.ReservationStatusHistory) error {
	if err := r.database.Conn(ctx).Table("reservation_status_history").Create(&history).Error; err != nil {
		r.logger.Error().Msg("Error al crear historial de status de reserva")
		return err
	}
	return nil
}

func (r Repository) GetLatestReservationByClient(ctx context.Context, clientID uint) (*domain.Reservation, error) {
	var reservation domain.Reservation
	if err := r.database.Conn(ctx).Table("reservation").Where("client_id = ?", clientID).Order("id DESC").First(&reservation).Error; err != nil {
		r.logger.Error().Msg("Error al obtener la última reserva del cliente")
		return nil, err
	}
	return &reservation, nil
}

func (r Repository) GetReserves(ctx context.Context, statusID *uint, clientID *uint, tableID *uint, startDate *time.Time, endDate *time.Time) ([]domain.ReserveDetailDTO, error) {
	// Struct temporal para el scan sin StatusHistory
	type reserveTemp struct {
		ReservaID            uint
		StartAt              time.Time
		EndAt                time.Time
		NumberOfGuests       int
		ReservaCreada        time.Time
		ReservaActualizada   time.Time
		EstadoCodigo         string
		EstadoNombre         string
		ClienteID            uint
		ClienteNombre        string
		ClienteEmail         string
		ClienteTelefono      string
		ClienteDni           uint
		MesaID               *uint
		MesaNumero           *int
		MesaCapacidad        *int
		RestauranteID        uint
		RestauranteNombre    string
		RestauranteCodigo    string
		RestauranteDireccion string
		UsuarioID            *uint
		UsuarioNombre        *string
		UsuarioEmail         *string
	}

	var tempResults []reserveTemp

	// Primera query: obtener las reservas
	query := r.database.Conn(ctx).
		Table("reservation r").
		Select(`
			r.id as reserva_id,
			r.start_at,
			r.end_at,
			r.number_of_guests,
			r.created_at as reserva_creada,
			r.updated_at as reserva_actualizada,
			rs.code as estado_codigo,
			rs.name as estado_nombre,
			c.id as cliente_id,
			c.name as cliente_nombre,
			c.email as cliente_email,
			c.phone as cliente_telefono,
			c.dni as cliente_dni,
			t.id as mesa_id,
			t.number as mesa_numero,
			t.capacity as mesa_capacidad,
			rest.id as restaurante_id,
			rest.name as restaurante_nombre,
			rest.code as restaurante_codigo,
			rest.address as restaurante_direccion,
			u.id as usuario_id,
			u.name as usuario_nombre,
			u.email as usuario_email
		`).
		Joins("LEFT JOIN client c ON r.client_id = c.id").
		Joins("LEFT JOIN \"table\" t ON r.table_id = t.id").
		Joins("LEFT JOIN reservation_status rs ON r.status_id = rs.id").
		Joins("LEFT JOIN restaurant rest ON r.restaurant_id = rest.id").
		Joins("LEFT JOIN \"user\" u ON r.created_by_user_id = u.id")

	// Aplicar filtros opcionales
	if statusID != nil {
		query = query.Where("r.status_id = ?", *statusID)
	}

	if clientID != nil {
		query = query.Where("r.client_id = ?", *clientID)
	}

	if tableID != nil {
		query = query.Where("r.table_id = ?", *tableID)
	}

	if startDate != nil {
		query = query.Where("r.created_at >= ?", *startDate)
	}

	if endDate != nil {
		query = query.Where("r.created_at <= ?", *endDate)
	}

	err := query.Order("r.start_at DESC").Scan(&tempResults).Error

	if err != nil {
		r.logger.Error().Msg("Error al obtener reservas")
		return nil, err
	}

	if len(tempResults) == 0 {
		return []domain.ReserveDetailDTO{}, nil
	}

	// Convertir tempResults a ReserveDetailDTO
	results := make([]domain.ReserveDetailDTO, len(tempResults))
	reservationIDs := make([]uint, len(tempResults))

	for i, temp := range tempResults {
		results[i] = domain.ReserveDetailDTO{
			ReservaID:            temp.ReservaID,
			StartAt:              temp.StartAt,
			EndAt:                temp.EndAt,
			NumberOfGuests:       temp.NumberOfGuests,
			ReservaCreada:        temp.ReservaCreada,
			ReservaActualizada:   temp.ReservaActualizada,
			EstadoCodigo:         temp.EstadoCodigo,
			EstadoNombre:         temp.EstadoNombre,
			ClienteID:            temp.ClienteID,
			ClienteNombre:        temp.ClienteNombre,
			ClienteEmail:         temp.ClienteEmail,
			ClienteTelefono:      temp.ClienteTelefono,
			ClienteDni:           temp.ClienteDni,
			MesaID:               temp.MesaID,
			MesaNumero:           temp.MesaNumero,
			MesaCapacidad:        temp.MesaCapacidad,
			RestauranteID:        temp.RestauranteID,
			RestauranteNombre:    temp.RestauranteNombre,
			RestauranteCodigo:    temp.RestauranteCodigo,
			RestauranteDireccion: temp.RestauranteDireccion,
			UsuarioID:            temp.UsuarioID,
			UsuarioNombre:        temp.UsuarioNombre,
			UsuarioEmail:         temp.UsuarioEmail,
			StatusHistory:        []domain.ReservationStatusHistory{}, // Inicializar vacío
		}
		reservationIDs[i] = temp.ReservaID
	}

	// Segunda query: obtener todo el historial de una vez
	var historyResults []struct {
		ReservationID     uint      `json:"reservation_id"`
		HistoryID         uint      `json:"history_id"`
		StatusID          uint      `json:"status_id"`
		StatusCode        string    `json:"status_code"`
		StatusName        string    `json:"status_name"`
		ChangedByUserID   *uint     `json:"changed_by_user_id"`
		ChangedByUserName *string   `json:"changed_by_user_name"`
		CreatedAt         time.Time `json:"created_at"`
		UpdatedAt         time.Time `json:"updated_at"`
	}

	err = r.database.Conn(ctx).
		Table("reservation_status_history rsh").
		Select(`
			rsh.reservation_id,
			rsh.id as history_id,
			rsh.status_id,
			rs.code as status_code,
			rs.name as status_name,
			rsh.changed_by_user_id,
			u.name as changed_by_user_name,
			rsh.created_at,
			rsh.updated_at
		`).
		Joins("LEFT JOIN reservation_status rs ON rsh.status_id = rs.id").
		Joins("LEFT JOIN \"user\" u ON rsh.changed_by_user_id = u.id").
		Where("rsh.reservation_id IN ?", reservationIDs).
		Order("rsh.reservation_id, rsh.created_at ASC").
		Scan(&historyResults).Error

	if err != nil {
		r.logger.Error().Msg("Error al obtener historial de reservas")
		return nil, err
	}

	// Mapear historial a cada reserva
	historyMap := make(map[uint][]domain.ReservationStatusHistory)
	for _, h := range historyResults {
		historyMap[h.ReservationID] = append(historyMap[h.ReservationID], domain.ReservationStatusHistory{
			ID:              h.HistoryID,
			StatusID:        h.StatusID,
			StatusCode:      h.StatusCode,
			StatusName:      h.StatusName,
			ChangedByUserID: h.ChangedByUserID,
			ChangedByUser:   h.ChangedByUserName,
			CreatedAt:       h.CreatedAt,
			UpdatedAt:       h.UpdatedAt,
		})
	}

	// Asignar historial a cada reserva
	for i := range results {
		if history, exists := historyMap[results[i].ReservaID]; exists {
			results[i].StatusHistory = history
		} else {
			results[i].StatusHistory = []domain.ReservationStatusHistory{}
		}
	}

	return results, nil
}

func (r Repository) CancelReservation(ctx context.Context, id uint, reason string) (string, error) {
	// Primero verificar que la reserva existe
	var existingReservation domain.Reservation
	if err := r.database.Conn(ctx).Table("reservation").Where("id = ?", id).First(&existingReservation).Error; err != nil {
		r.logger.Error().Err(err).Msgf("Reserva con ID %d no encontrada", id)
		return "", nil // Reserva no encontrada
	}

	r.logger.Info().Msgf("Cancelando reserva ID: %d, Status actual: %d", id, existingReservation.StatusID)

	// Actualizar el status de la reserva a "cancelado" (status_id = 4)
	result := r.database.Conn(ctx).Table("reservation").
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"status_id": 4, // Estado cancelado
		})

	if result.Error != nil {
		r.logger.Error().Err(result.Error).Msgf("Error al actualizar reserva ID %d", id)
		return "", result.Error
	}

	r.logger.Info().Msgf("Reserva ID %d actualizada. Filas afectadas: %d", id, result.RowsAffected)

	if result.RowsAffected == 0 {
		r.logger.Warn().Msgf("No se actualizó ninguna fila para reserva ID %d", id)
		return "", nil // Reserva no encontrada
	}

	// Crear registro en historial
	history := domain.ReservationStatusHistory{
		ReservationID: id,
		StatusID:      4, // Estado cancelado
		// ChangedByUserID se puede agregar después si es necesario
	}

	if err := r.database.Conn(ctx).Table("reservation_status_history").Create(&history).Error; err != nil {
		r.logger.Error().Err(err).Msgf("Error al crear historial de cancelación para reserva ID %d", id)
		// No retornamos error aquí porque la reserva ya se canceló
	} else {
		r.logger.Info().Msgf("Historial de cancelación creado para reserva ID %d", id)
	}

	return "Reserva cancelada exitosamente", nil
}

func (r Repository) UpdateReservation(ctx context.Context, id uint, tableID *uint, startAt *time.Time, endAt *time.Time, numberOfGuests *int) (string, error) {
	updates := make(map[string]interface{})

	if tableID != nil {
		updates["table_id"] = tableID
	}
	if startAt != nil {
		updates["start_at"] = startAt
	}
	if endAt != nil {
		updates["end_at"] = endAt
	}
	if numberOfGuests != nil {
		updates["number_of_guests"] = numberOfGuests
	}

	if len(updates) == 0 {
		return "No hay campos para actualizar", nil
	}

	result := r.database.Conn(ctx).Table("reservation").
		Where("id = ?", id).
		Updates(updates)

	if result.Error != nil {
		r.logger.Error().Msg("Error al actualizar reserva")
		return "", result.Error
	}

	if result.RowsAffected == 0 {
		return "", nil // Reserva no encontrada
	}

	return "Reserva actualizada exitosamente", nil
}

func (r Repository) GetReserveByID(ctx context.Context, id uint) (*domain.ReserveDetailDTO, error) {
	// Struct temporal para el scan sin StatusHistory
	type reserveTemp struct {
		ReservaID            uint
		StartAt              time.Time
		EndAt                time.Time
		NumberOfGuests       int
		ReservaCreada        time.Time
		ReservaActualizada   time.Time
		EstadoCodigo         string
		EstadoNombre         string
		ClienteID            uint
		ClienteNombre        string
		ClienteEmail         string
		ClienteTelefono      string
		ClienteDni           uint
		MesaID               *uint
		MesaNumero           *int
		MesaCapacidad        *int
		RestauranteID        uint
		RestauranteNombre    string
		RestauranteCodigo    string
		RestauranteDireccion string
		UsuarioID            *uint
		UsuarioNombre        *string
		UsuarioEmail         *string
	}

	var tempResult reserveTemp

	err := r.database.Conn(ctx).
		Table("reservation r").
		Select(`
			r.id as reserva_id,
			r.start_at,
			r.end_at,
			r.number_of_guests,
			r.created_at as reserva_creada,
			r.updated_at as reserva_actualizada,
			rs.code as estado_codigo,
			rs.name as estado_nombre,
			c.id as cliente_id,
			c.name as cliente_nombre,
			c.email as cliente_email,
			c.phone as cliente_telefono,
			c.dni as cliente_dni,
			t.id as mesa_id,
			t.number as mesa_numero,
			t.capacity as mesa_capacidad,
			rest.id as restaurante_id,
			rest.name as restaurante_nombre,
			rest.code as restaurante_codigo,
			rest.address as restaurante_direccion,
			u.id as usuario_id,
			u.name as usuario_nombre,
			u.email as usuario_email
		`).
		Joins("LEFT JOIN client c ON r.client_id = c.id").
		Joins("LEFT JOIN \"table\" t ON r.table_id = t.id").
		Joins("LEFT JOIN reservation_status rs ON r.status_id = rs.id").
		Joins("LEFT JOIN restaurant rest ON r.restaurant_id = rest.id").
		Joins("LEFT JOIN \"user\" u ON r.created_by_user_id = u.id").
		Where("r.id = ?", id).
		Take(&tempResult).Error

	if err != nil {
		r.logger.Error().Msg("Error al obtener reserva por ID")
		return nil, err
	}

	// Convertir tempResult a ReserveDetailDTO
	result := domain.ReserveDetailDTO{
		ReservaID:            tempResult.ReservaID,
		StartAt:              tempResult.StartAt,
		EndAt:                tempResult.EndAt,
		NumberOfGuests:       tempResult.NumberOfGuests,
		ReservaCreada:        tempResult.ReservaCreada,
		ReservaActualizada:   tempResult.ReservaActualizada,
		EstadoCodigo:         tempResult.EstadoCodigo,
		EstadoNombre:         tempResult.EstadoNombre,
		ClienteID:            tempResult.ClienteID,
		ClienteNombre:        tempResult.ClienteNombre,
		ClienteEmail:         tempResult.ClienteEmail,
		ClienteTelefono:      tempResult.ClienteTelefono,
		ClienteDni:           tempResult.ClienteDni,
		MesaID:               tempResult.MesaID,
		MesaNumero:           tempResult.MesaNumero,
		MesaCapacidad:        tempResult.MesaCapacidad,
		RestauranteID:        tempResult.RestauranteID,
		RestauranteNombre:    tempResult.RestauranteNombre,
		RestauranteCodigo:    tempResult.RestauranteCodigo,
		RestauranteDireccion: tempResult.RestauranteDireccion,
		UsuarioID:            tempResult.UsuarioID,
		UsuarioNombre:        tempResult.UsuarioNombre,
		UsuarioEmail:         tempResult.UsuarioEmail,
		StatusHistory:        []domain.ReservationStatusHistory{}, // Inicializar vacío
	}

	// Obtener el historial de estados en una consulta optimizada
	var historyResults []struct {
		HistoryID         uint      `json:"history_id"`
		StatusID          uint      `json:"status_id"`
		StatusCode        string    `json:"status_code"`
		StatusName        string    `json:"status_name"`
		ChangedByUserID   *uint     `json:"changed_by_user_id"`
		ChangedByUserName *string   `json:"changed_by_user_name"`
		CreatedAt         time.Time `json:"created_at"`
		UpdatedAt         time.Time `json:"updated_at"`
	}

	err = r.database.Conn(ctx).
		Table("reservation_status_history rsh").
		Select(`
			rsh.id as history_id,
			rsh.status_id,
			rs.code as status_code,
			rs.name as status_name,
			rsh.changed_by_user_id,
			u.name as changed_by_user_name,
			rsh.created_at,
			rsh.updated_at
		`).
		Joins("LEFT JOIN reservation_status rs ON rsh.status_id = rs.id").
		Joins("LEFT JOIN \"user\" u ON rsh.changed_by_user_id = u.id").
		Where("rsh.reservation_id = ?", result.ReservaID).
		Order("rsh.created_at ASC").
		Scan(&historyResults).Error

	if err != nil {
		r.logger.Error().Msgf("Error al obtener historial para reserva ID %d", result.ReservaID)
		// Continuar sin historial en caso de error
		result.StatusHistory = []domain.ReservationStatusHistory{}
	} else {
		// Mapear historial a la reserva
		var history []domain.ReservationStatusHistory
		for _, h := range historyResults {
			history = append(history, domain.ReservationStatusHistory{
				ID:              h.HistoryID,
				StatusID:        h.StatusID,
				StatusCode:      h.StatusCode,
				StatusName:      h.StatusName,
				ChangedByUserID: h.ChangedByUserID,
				ChangedByUser:   h.ChangedByUserName,
				CreatedAt:       h.CreatedAt,
				UpdatedAt:       h.UpdatedAt,
			})
		}
		result.StatusHistory = history
	}

	return &result, nil
}

func (r Repository) GetReservationStatuses(ctx context.Context) ([]domain.ReservationStatus, error) {
	var statuses []domain.ReservationStatus
	if err := r.database.Conn(ctx).Table("reservation_status").Find(&statuses).Error; err != nil {
		r.logger.Error().Msg("Error al obtener estados de reserva")
		return nil, err
	}
	return statuses, nil
}

func (r Repository) GetReservationStatusHistory(ctx context.Context, reservationID uint) ([]domain.ReservationStatusHistory, error) {
	var history []domain.ReservationStatusHistory

	err := r.database.Conn(ctx).
		Table("reservation_status_history rsh").
		Select(`
			rsh.id,
			rsh.reservation_id,
			rsh.status_id,
			rsh.changed_by_user_id,
			rsh.created_at,
			rsh.updated_at,
			rsh.deleted_at,
			rs.code as status_code,
			rs.name as status_name,
			u.name as changed_by_user
		`).
		Joins("LEFT JOIN reservation_status rs ON rsh.status_id = rs.id").
		Joins("LEFT JOIN \"user\" u ON rsh.changed_by_user_id = u.id").
		Where("rsh.reservation_id = ?", reservationID).
		Order("rsh.created_at ASC").
		Scan(&history).Error

	if err != nil {
		r.logger.Error().Msgf("Error al obtener historial de estados para reserva ID %d", reservationID)
		return nil, err
	}

	return history, nil
}
