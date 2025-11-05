package repository

import (
	"dbpostgres/app/domain"
	"dbpostgres/app/infra/models"
	"dbpostgres/pkg/log"

	"gorm.io/gorm"
)

// tableRepository implementa domain.TableRepository
type tableRepository struct {
	db     *gorm.DB
	logger log.ILogger
}

// NewTableRepository crea una nueva instancia del repositorio de mesas
func NewTableRepository(db *gorm.DB, logger log.ILogger) domain.TableRepository {
	return &tableRepository{
		db:     db,
		logger: logger,
	}
}

// Create crea una nueva mesa
func (r *tableRepository) Create(table *models.Table) error {
	if err := r.db.Create(table).Error; err != nil {
		r.logger.Error().Err(err).Uint("business_id", table.BusinessID).Int("table_number", table.Number).Msg("Error al crear mesa")
		return err
	}
	r.logger.Debug().Uint("business_id", table.BusinessID).Int("table_number", table.Number).Msg("Mesa creada exitosamente")
	return nil
}

// GetByBusinessAndNumber obtiene una mesa por negocio y número
func (r *tableRepository) GetByBusinessAndNumber(businessID uint, number int) (*models.Table, error) {
	var table models.Table
	if err := r.db.Where("business_id = ? AND number = ?", businessID, number).First(&table).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		r.logger.Error().Err(err).Uint("business_id", businessID).Int("table_number", number).Msg("Error al obtener mesa por negocio y número")
		return nil, err
	}
	return &table, nil
}

// GetByBusiness obtiene todas las mesas de un negocio
func (r *tableRepository) GetByBusiness(businessID uint) ([]models.Table, error) {
	var tables []models.Table
	if err := r.db.Where("business_id = ?", businessID).Find(&tables).Error; err != nil {
		r.logger.Error().Err(err).Uint("business_id", businessID).Msg("Error al obtener mesas del negocio")
		return nil, err
	}
	return tables, nil
}

// ExistsByBusinessAndNumber verifica si existe una mesa por negocio y número
func (r *tableRepository) ExistsByBusinessAndNumber(businessID uint, number int) (bool, error) {
	var count int64
	if err := r.db.Model(&models.Table{}).Where("business_id = ? AND number = ?", businessID, number).Count(&count).Error; err != nil {
		r.logger.Error().Err(err).Uint("business_id", businessID).Int("table_number", number).Msg("Error al verificar existencia de mesa")
		return false, err
	}
	return count > 0, nil
}
