package repository

import (
	"dbpostgres/app/domain"
	"dbpostgres/app/infra/models"
	"dbpostgres/pkg/log"

	"gorm.io/gorm"
)

// roleRepository implementa domain.RoleRepository
type roleRepository struct {
	db     *gorm.DB
	logger log.ILogger
}

// NewRoleRepository crea una nueva instancia del repositorio de roles
func NewRoleRepository(db *gorm.DB, logger log.ILogger) domain.RoleRepository {
	return &roleRepository{
		db:     db,
		logger: logger,
	}
}

// Create crea un nuevo rol
func (r *roleRepository) Create(role *models.Role) error {
	if err := r.db.Create(role).Error; err != nil {
		r.logger.Error().Err(err).Str("code", role.Code).Msg("Error al crear rol")
		return err
	}
	return nil
}

// GetByCode obtiene un rol por su código
func (r *roleRepository) GetByCode(code string) (*models.Role, error) {
	var role models.Role
	if err := r.db.Where("code = ?", code).First(&role).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		r.logger.Error().Err(err).Str("code", code).Msg("Error al obtener rol por código")
		return nil, err
	}
	return &role, nil
}

// GetAll obtiene todos los roles
func (r *roleRepository) GetAll() ([]models.Role, error) {
	var roles []models.Role
	if err := r.db.Find(&roles).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al obtener todos los roles")
		return nil, err
	}
	return roles, nil
}

// ExistsByCode verifica si existe un rol con el código especificado
func (r *roleRepository) ExistsByCode(code string) (bool, error) {
	var count int64
	if err := r.db.Model(&models.Role{}).Where("code = ?", code).Count(&count).Error; err != nil {
		r.logger.Error().Err(err).Str("code", code).Msg("Error al verificar existencia de rol por código")
		return false, err
	}
	return count > 0, nil
}

// AssignPermissions asigna permisos a un rol
func (r *roleRepository) AssignPermissions(roleID uint, permissionIDs []uint) error {
	// Primero, eliminamos los permisos actuales del rol en la tabla role_permissions
	if err := r.db.Table("role_permissions").Where("role_id = ?", roleID).Delete(nil).Error; err != nil {
		r.logger.Error().Err(err).Uint("role_id", roleID).Msg("Error al eliminar permisos actuales del rol")
		return err
	}

	// Si no hay permisos para asignar, terminamos aquí
	if len(permissionIDs) == 0 {
		r.logger.Info().Uint("role_id", roleID).Int("permissions_count", 0).Msg("No se asignaron permisos al rol (lista vacía)")
		return nil
	}

	// Preparamos los valores para el batch insert
	var rolePermissions []map[string]interface{}
	for _, permissionID := range permissionIDs {
		rolePermissions = append(rolePermissions, map[string]interface{}{
			"role_id":       roleID,
			"permission_id": permissionID,
		})
	}

	// Insertamos los nuevos permisos en la tabla role_permissions usando GORM ORM y Table
	if err := r.db.Table("role_permissions").Create(&rolePermissions).Error; err != nil {
		r.logger.Error().Err(err).Uint("role_id", roleID).Msg("Error al asignar nuevos permisos al rol")
		return err
	}

	r.logger.Info().Uint("role_id", roleID).Int("permissions_count", len(permissionIDs)).Msg("Permisos asignados al rol correctamente")
	return nil
}
