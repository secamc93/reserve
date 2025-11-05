package repository

import (
	"dbpostgres/app/domain"
	"dbpostgres/app/infra/models"
	"dbpostgres/pkg/log"

	"gorm.io/gorm"
)

// businessRepository implementa domain.BusinessRepository
type businessRepository struct {
	db     *gorm.DB
	logger log.ILogger
}

// NewBusinessRepository crea una nueva instancia del repositorio de negocios
func NewBusinessRepository(db *gorm.DB, logger log.ILogger) domain.BusinessRepository {
	return &businessRepository{
		db:     db,
		logger: logger,
	}
}

// Create crea un nuevo negocio
func (r *businessRepository) Create(business *models.Business) error {
	if err := r.db.Create(business).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al crear negocio")
		return err
	}
	return nil
}

// GetByCode obtiene un negocio por su código
func (r *businessRepository) GetByCode(code string) (*models.Business, error) {
	var business models.Business
	if err := r.db.Where("code = ?", code).First(&business).Error; err != nil {
		r.logger.Error().Err(err).Str("code", code).Msg("Error al obtener negocio por código")
		return nil, err
	}
	return &business, nil
}

// GetByID obtiene un negocio por su ID
func (r *businessRepository) GetByID(id uint) (*models.Business, error) {
	var business models.Business
	if err := r.db.First(&business, id).Error; err != nil {
		r.logger.Error().Err(err).Uint("id", id).Msg("Error al obtener negocio por ID")
		return nil, err
	}
	return &business, nil
}

// ExistsByCode verifica si existe un negocio con el código especificado
func (r *businessRepository) ExistsByCode(code string) (bool, error) {
	var count int64
	if err := r.db.Model(&models.Business{}).Where("code = ?", code).Count(&count).Error; err != nil {
		r.logger.Error().Err(err).Str("code", code).Msg("Error al verificar existencia de negocio por código")
		return false, err
	}
	return count > 0, nil
}
