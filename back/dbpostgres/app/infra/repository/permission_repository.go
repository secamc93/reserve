package repository

import (
	"dbpostgres/app/domain"
	"dbpostgres/app/infra/models"
	"dbpostgres/pkg/log"

	"gorm.io/gorm"
)

// permissionRepository implementa domain.PermissionRepository
type permissionRepository struct {
	db     *gorm.DB
	logger log.ILogger
}

// NewPermissionRepository crea una nueva instancia del repositorio de permisos
func NewPermissionRepository(db *gorm.DB, logger log.ILogger) domain.PermissionRepository {
	return &permissionRepository{
		db:     db,
		logger: logger,
	}
}

// Create crea un nuevo permiso
func (r *permissionRepository) Create(permission *models.Permission) error {
	if err := r.db.Create(permission).Error; err != nil {
		r.logger.Error().Err(err).Str("code", permission.Code).Msg("Error al crear permiso")
		return err
	}
	return nil
}

// GetByCode obtiene un permiso por su código
func (r *permissionRepository) GetByCode(code string) (*models.Permission, error) {
	var permission models.Permission
	if err := r.db.Where("code = ?", code).First(&permission).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		r.logger.Error().Err(err).Str("code", code).Msg("Error al obtener permiso por código")
		return nil, err
	}
	return &permission, nil
}

// GetAll obtiene todos los permisos
func (r *permissionRepository) GetAll() ([]models.Permission, error) {
	var permissions []models.Permission
	if err := r.db.Find(&permissions).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al obtener todos los permisos")
		return nil, err
	}
	return permissions, nil
}

// ExistsByCode verifica si existe un permiso con el código especificado
func (r *permissionRepository) ExistsByCode(code string) (bool, error) {
	var count int64
	if err := r.db.Model(&models.Permission{}).Where("code = ?", code).Count(&count).Error; err != nil {
		r.logger.Error().Err(err).Str("code", code).Msg("Error al verificar existencia de permiso por código")
		return false, err
	}
	return count > 0, nil
}
