package repository

import (
	"central_reserve/services/rooms/internal/domain"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
	"context"
	"fmt"
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
	if err := r.database.Conn(ctx).Table("room").Create(&room).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al crear sala")
		return "", err
	}
	return fmt.Sprintf("Sala creada con ID: %d", room.ID), nil
}

// GetRooms obtiene todas las salas
func (r *Repository) GetRooms(ctx context.Context) ([]domain.Room, error) {
	var rooms []domain.Room
	if err := r.database.Conn(ctx).Table("room").Find(&rooms).Error; err != nil {
		r.logger.Error().Msg("Error al obtener salas")
		return nil, err
	}
	return rooms, nil
}

// GetRoomsByBusinessID obtiene todas las salas de un negocio específico
func (r *Repository) GetRoomsByBusinessID(ctx context.Context, businessID uint) ([]domain.Room, error) {
	var rooms []domain.Room
	if err := r.database.Conn(ctx).Table("room").Where("business_id = ?", businessID).Find(&rooms).Error; err != nil {
		r.logger.Error().Uint("businessID", businessID).Msg("Error al obtener salas por negocio")
		return nil, err
	}
	return rooms, nil
}

// GetRoomByID obtiene una sala por su ID
func (r *Repository) GetRoomByID(ctx context.Context, id uint) (*domain.Room, error) {
	var room domain.Room
	if err := r.database.Conn(ctx).Table("room").Where("id = ?", id).First(&room).Error; err != nil {
		r.logger.Error().Uint("id", id).Msg("Error al obtener sala por ID")
		return nil, err
	}
	return &room, nil
}

// GetRoomByCodeAndBusiness obtiene una sala por su código y negocio
func (r *Repository) GetRoomByCodeAndBusiness(ctx context.Context, code string, businessID uint) (*domain.Room, error) {
	var room domain.Room
	if err := r.database.Conn(ctx).Table("room").Where("code = ? AND business_id = ?", code, businessID).First(&room).Error; err != nil {
		r.logger.Error().Str("code", code).Uint("businessID", businessID).Msg("Error al obtener sala por código y negocio")
		return nil, err
	}
	return &room, nil
}

// UpdateRoom actualiza una sala existente
func (r *Repository) UpdateRoom(ctx context.Context, id uint, room domain.Room) (string, error) {
	if err := r.database.Conn(ctx).Table("room").Where("id = ?", id).Updates(&room).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al actualizar sala")
		return "", err
	}
	return fmt.Sprintf("Sala actualizada con ID: %d", id), nil
}

// DeleteRoom elimina una sala
func (r *Repository) DeleteRoom(ctx context.Context, id uint) (string, error) {
	if err := r.database.Conn(ctx).Table("room").Where("id = ?", id).Delete(&domain.Room{}).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al eliminar sala")
		return "", err
	}
	return fmt.Sprintf("Sala eliminada con ID: %d", id), nil
}
