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
	var results []domain.ReserveDetailDTO

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

	err := query.Order("r.start_at DESC").Scan(&results).Error

	if err != nil {
		r.logger.Error().Msg("Error al obtener reservas")
		return nil, err
	}

	return results, nil
}

func (r Repository) CancelReservation(ctx context.Context, id uint, reason string) (string, error) {
	// Actualizar el status de la reserva a "cancelado" (status_id = 3)
	result := r.database.Conn(ctx).Table("reservation").
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"status_id": 3, // Estado cancelado
		})

	if result.Error != nil {
		r.logger.Error().Msg("Error al cancelar reserva")
		return "", result.Error
	}

	if result.RowsAffected == 0 {
		return "", nil // Reserva no encontrada
	}

	// Crear registro en historial
	history := domain.ReservationStatusHistory{
		ReservationID: id,
		StatusID:      3, // Estado cancelado
		// ChangedByUserID se puede agregar después si es necesario
	}

	if err := r.database.Conn(ctx).Table("reservation_status_history").Create(&history).Error; err != nil {
		r.logger.Error().Msg("Error al crear historial de cancelación")
		// No retornamos error aquí porque la reserva ya se canceló
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
	var result domain.ReserveDetailDTO

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
		Take(&result).Error

	if err != nil {
		r.logger.Error().Msg("Error al obtener reserva por ID")
		return nil, err
	}

	return &result, nil
}
