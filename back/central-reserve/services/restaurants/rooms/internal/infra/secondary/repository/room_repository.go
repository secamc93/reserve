package repository

import (
	"context"
	"fmt"

	"central_reserve/services/restaurants/rooms/internal/domain"
	"central_reserve/services/restaurants/rooms/internal/infra/secondary/models"
	"central_reserve/services/restaurants/rooms/internal/infra/secondary/repository/mappers"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
)

type Repository struct {
	database db.IDatabase
	logger   log.ILogger
}

func New(db db.IDatabase, logger log.ILogger) domain.IRoomRepository {
	return &Repository{
		database: db,
		logger:   logger,
	}
}

// CreateRoom crea una nueva sala
func (r *Repository) CreateRoom(ctx context.Context, room domain.Room) (string, error) {
	model := mappers.RoomToModel(&room)

	if err := r.database.Conn(ctx).Create(model).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al crear sala")
		return "", err
	}

	return fmt.Sprintf("Sala creada con ID: %d", model.ID), nil
}

// GetRooms obtiene todas las salas
func (r *Repository) GetRooms(ctx context.Context) ([]domain.Room, error) {
	var roomModels []*models.RoomModel

	if err := r.database.Conn(ctx).Find(&roomModels).Error; err != nil {
		r.logger.Error().Msg("Error al obtener salas")
		return nil, err
	}

	// Convertir a dominio
	domainRooms := mappers.RoomsToDomain(roomModels)

	// Convertir de []*domain.Room a []domain.Room
	result := make([]domain.Room, len(domainRooms))
	for i, r := range domainRooms {
		result[i] = *r
	}

	return result, nil
}

// GetRoomsByBusinessID obtiene todas las salas de un negocio específico
func (r *Repository) GetRoomsByBusinessID(ctx context.Context, businessID uint) ([]domain.Room, error) {
	var roomModels []*models.RoomModel

	if err := r.database.Conn(ctx).Where("business_id = ?", businessID).Find(&roomModels).Error; err != nil {
		r.logger.Error().Uint("businessID", businessID).Msg("Error al obtener salas por negocio")
		return nil, err
	}

	// Convertir a dominio
	domainRooms := mappers.RoomsToDomain(roomModels)

	// Convertir de []*domain.Room a []domain.Room
	result := make([]domain.Room, len(domainRooms))
	for i, r := range domainRooms {
		result[i] = *r
	}

	return result, nil
}

// GetRoomByID obtiene una sala por su ID
func (r *Repository) GetRoomByID(ctx context.Context, id uint) (*domain.Room, error) {
	var roomModel models.RoomModel

	if err := r.database.Conn(ctx).Where("id = ?", id).First(&roomModel).Error; err != nil {
		r.logger.Error().Uint("id", id).Msg("Error al obtener sala por ID")
		return nil, err
	}

	return mappers.RoomToDomain(&roomModel), nil
}

// GetRoomByCodeAndBusiness obtiene una sala por su código y negocio
func (r *Repository) GetRoomByCodeAndBusiness(ctx context.Context, code string, businessID uint) (*domain.Room, error) {
	var roomModel models.RoomModel

	if err := r.database.Conn(ctx).Where("code = ? AND business_id = ?", code, businessID).First(&roomModel).Error; err != nil {
		r.logger.Error().Str("code", code).Uint("businessID", businessID).Msg("Error al obtener sala por código y negocio")
		return nil, err
	}

	return mappers.RoomToDomain(&roomModel), nil
}

// UpdateRoom actualiza una sala existente
func (r *Repository) UpdateRoom(ctx context.Context, id uint, room domain.Room) (string, error) {
	model := mappers.RoomToModel(&room)
	model.ID = id // Asegurar que el ID sea el correcto

	if err := r.database.Conn(ctx).Where("id = ?", id).Updates(model).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al actualizar sala")
		return "", err
	}

	return fmt.Sprintf("Sala actualizada con ID: %d", id), nil
}

// DeleteRoom elimina una sala
func (r *Repository) DeleteRoom(ctx context.Context, id uint) (string, error) {
	if err := r.database.Conn(ctx).Where("id = ?", id).Delete(&models.RoomModel{}).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al eliminar sala")
		return "", err
	}

	return fmt.Sprintf("Sala eliminada con ID: %d", id), nil
}
