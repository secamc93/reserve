package repository

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/parking/internal/domain"
	"central_reserve/services/horizontalproperty/parking/internal/infra/secondary/repository/mappers"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

type ParkingTypeRepository struct {
	db     db.IDatabase
	logger log.ILogger
}

func NewParkingTypeRepository(db db.IDatabase, logger log.ILogger) domain.ParkingTypeRepository {
	return &ParkingTypeRepository{
		db:     db,
		logger: logger,
	}
}

// GetAllParkingTypes obtiene todos los tipos de parqueadero
func (r *ParkingTypeRepository) GetAllParkingTypes(ctx context.Context) ([]*domain.ParkingType, error) {
	var types []models.ParkingType
	if err := r.db.Conn(ctx).Order("name ASC").Find(&types).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error obteniendo tipos de parqueadero")
		return nil, fmt.Errorf("error obteniendo tipos de parqueadero: %w", err)
	}

	result := make([]*domain.ParkingType, len(types))
	for i, t := range types {
		result[i] = mappers.ParkingTypeToDomain(&t)
	}

	return result, nil
}

// GetActiveParkingTypes obtiene los tipos de parqueadero activos
func (r *ParkingTypeRepository) GetActiveParkingTypes(ctx context.Context) ([]*domain.ParkingType, error) {
	var types []models.ParkingType
	if err := r.db.Conn(ctx).Where("is_active = ?", true).Order("name ASC").Find(&types).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error obteniendo tipos de parqueadero activos")
		return nil, fmt.Errorf("error obteniendo tipos de parqueadero activos: %w", err)
	}

	result := make([]*domain.ParkingType, len(types))
	for i, t := range types {
		result[i] = mappers.ParkingTypeToDomain(&t)
	}

	return result, nil
}

// GetParkingTypeByID obtiene un tipo de parqueadero por ID
func (r *ParkingTypeRepository) GetParkingTypeByID(ctx context.Context, id uint) (*domain.ParkingType, error) {
	var parkingType models.ParkingType
	if err := r.db.Conn(ctx).First(&parkingType, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("error obteniendo tipo de parqueadero: %w", err)
	}

	return mappers.ParkingTypeToDomain(&parkingType), nil
}
