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
		r.logger.Error().Err(err).Str("name", role.Name).Msg("Error al crear rol")
		return err
	}
	return nil
}

// GetByName obtiene un rol por su nombre
func (r *roleRepository) GetByName(name string) (*models.Role, error) {
	var role models.Role
	if err := r.db.Where("name = ?", name).First(&role).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		r.logger.Error().Err(err).Str("name", name).Msg("Error al obtener rol por nombre")
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

// ExistsByName verifica si existe un rol con el nombre especificado
func (r *roleRepository) ExistsByName(name string) (bool, error) {
	var count int64
	if err := r.db.Model(&models.Role{}).Where("name = ?", name).Count(&count).Error; err != nil {
		r.logger.Error().Err(err).Str("name", name).Msg("Error al verificar existencia de rol por nombre")
		return false, err
	}
	return count > 0, nil
}

// AssignPermissions asigna permisos a un rol
func (r *roleRepository) AssignPermissions(roleID uint, permissionIDs []uint) error {
	r.logger.Info().Uint("role_id", roleID).Int("permissions_count", len(permissionIDs)).Msg("Asignando permisos al rol...")

	// Si no hay permisos para asignar, terminamos aquí
	if len(permissionIDs) == 0 {
		r.logger.Info().Uint("role_id", roleID).Int("permissions_count", 0).Msg("No se asignaron permisos al rol (lista vacía)")
		return nil
	}

	// Eliminar duplicados de permissionIDs
	uniquePermissionIDs := make(map[uint]bool)
	var deduplicatedPermissionIDs []uint
	for _, permissionID := range permissionIDs {
		if !uniquePermissionIDs[permissionID] {
			uniquePermissionIDs[permissionID] = true
			deduplicatedPermissionIDs = append(deduplicatedPermissionIDs, permissionID)
		}
	}

	if len(deduplicatedPermissionIDs) != len(permissionIDs) {
		r.logger.Warn().Uint("role_id", roleID).
			Int("original_count", len(permissionIDs)).
			Int("deduplicated_count", len(deduplicatedPermissionIDs)).
			Msg("Se encontraron permisos duplicados, se eliminaron automáticamente")
	}

	// Verificar qué permisos ya están asignados al rol
	var existingPermissionIDs []uint
	if err := r.db.Table("role_permissions").
		Where("role_id = ?", roleID).
		Pluck("permission_id", &existingPermissionIDs).Error; err != nil {
		r.logger.Error().Err(err).Uint("role_id", roleID).Msg("Error al obtener permisos existentes del rol")
		return err
	}

	// Crear un mapa de permisos existentes para búsqueda rápida
	existingPermissionsMap := make(map[uint]bool)
	for _, existingID := range existingPermissionIDs {
		existingPermissionsMap[existingID] = true
	}

	// Filtrar solo los permisos que no están asignados
	var newPermissionIDs []uint
	for _, permissionID := range deduplicatedPermissionIDs {
		if !existingPermissionsMap[permissionID] {
			newPermissionIDs = append(newPermissionIDs, permissionID)
		}
	}

	// Si no hay permisos nuevos para asignar, terminamos aquí
	if len(newPermissionIDs) == 0 {
		r.logger.Info().Uint("role_id", roleID).
			Int("existing_count", len(existingPermissionIDs)).
			Msg("Todos los permisos ya están asignados al rol")
		return nil
	}

	// Preparamos los valores para el batch insert
	var rolePermissions []map[string]interface{}
	for _, permissionID := range newPermissionIDs {
		rolePermissions = append(rolePermissions, map[string]interface{}{
			"role_id":       roleID,
			"permission_id": permissionID,
		})
	}

	// Insertamos solo los permisos nuevos
	if err := r.db.Table("role_permissions").Create(&rolePermissions).Error; err != nil {
		r.logger.Error().Err(err).Uint("role_id", roleID).Msg("Error al asignar nuevos permisos al rol")
		return err
	}

	r.logger.Info().Uint("role_id", roleID).
		Int("existing_count", len(existingPermissionIDs)).
		Int("new_count", len(newPermissionIDs)).
		Int("total_count", len(existingPermissionIDs)+len(newPermissionIDs)).
		Msg("Permisos asignados al rol correctamente")
	return nil
}
