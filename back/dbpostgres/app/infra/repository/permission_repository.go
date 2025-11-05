package repository

import (
	"dbpostgres/app/domain"
	"dbpostgres/app/infra/models"
	"dbpostgres/pkg/log"

	"fmt"

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
		r.logger.Error().Err(err).Uint("resource_id", permission.ResourceID).Uint("action_id", permission.ActionID).Uint("scope_id", permission.ScopeID).Msg("Error al crear permiso")
		return err
	}
	return nil
}

// GetByResourceActionScope obtiene un permiso por ResourceID, ActionID y ScopeID
func (r *permissionRepository) GetByResourceActionScope(resourceID uint, actionID uint, scopeID uint) (*models.Permission, error) {
	var permission models.Permission
	if err := r.db.Where("resource_id = ? AND action_id = ? AND scope_id = ?", resourceID, actionID, scopeID).First(&permission).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		r.logger.Error().Err(err).Uint("resource_id", resourceID).Uint("action_id", actionID).Uint("scope_id", scopeID).Msg("Error al obtener permiso por ResourceID, ActionID y ScopeID")
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

// GetPermissionByResourceAndAction obtiene un permiso por nombre de recurso y nombre de acción
// Este método es útil para mapear códigos antiguos (resource:action) a nuevos permisos
func (r *permissionRepository) GetPermissionByResourceAndAction(resourceName, actionName string) (*models.Permission, error) {
	// Obtener el recurso por nombre
	var resource models.Resource
	if err := r.db.Where("name = ?", resourceName).First(&resource).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("recurso '%s' no encontrado", resourceName)
		}
		return nil, err
	}

	// Obtener la acción por nombre
	var action models.Action
	if err := r.db.Where("name = ?", actionName).First(&action).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("acción '%s' no encontrada", actionName)
		}
		return nil, err
	}

	// Buscar el permiso por ResourceID y ActionID
	var permission models.Permission
	if err := r.db.Where("resource_id = ? AND action_id = ?", resource.ID, action.ID).First(&permission).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("permiso con recurso '%s' y acción '%s' no encontrado", resourceName, actionName)
		}
		return nil, err
	}

	return &permission, nil
}

// ExistsByCode verifica si existe un permiso con el código especificado (mantenido para compatibilidad)
func (r *permissionRepository) ExistsByCode(code string) (bool, error) {
	// Como ya no tenemos el campo Code, este método ahora verifica por una combinación
	// de ResourceID, ActionID y ScopeID basado en el código generado
	r.logger.Warn().Str("code", code).Msg("Método ExistsByCode deprecado, usando ExistsByResourceActionScope")
	return false, nil
}

// ExistsByResourceActionScope verifica si existe un permiso con ResourceID, ActionID y ScopeID específicos
func (r *permissionRepository) ExistsByResourceActionScope(resourceID uint, actionID uint, scopeID uint) (bool, error) {
	var count int64
	if err := r.db.Model(&models.Permission{}).Where("resource_id = ? AND action_id = ? AND scope_id = ?", resourceID, actionID, scopeID).Count(&count).Error; err != nil {
		r.logger.Error().Err(err).Uint("resource_id", resourceID).Uint("action_id", actionID).Uint("scope_id", scopeID).Msg("Error al verificar existencia de permiso por ResourceID, ActionID y ScopeID")
		return false, err
	}
	return count > 0, nil
}
