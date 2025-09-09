package repository

import (
	"central_reserve/services/auth/internal/domain"
	"central_reserve/services/auth/internal/infra/secondary/repository/mappers"
	"context"
	"dbpostgres/app/infra/models"
	"fmt"
)

// GetPermissions obtiene todos los permisos
func (r *Repository) GetPermissions(ctx context.Context) ([]domain.Permission, error) {
	var permissions []models.Permission
	if err := r.database.Conn(ctx).
		Model(&models.Permission{}).
		Preload("Scope").
		Preload("Resource").
		Preload("Action").
		Find(&permissions).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al obtener permisos")
		return nil, err
	}
	return mappers.ToPermissionEntitySlice(permissions), nil
}

// GetPermissionByID obtiene un permiso por su ID
func (r *Repository) GetPermissionByID(ctx context.Context, id uint) (*domain.Permission, error) {
	var permission models.Permission
	if err := r.database.Conn(ctx).
		Model(&models.Permission{}).
		Preload("Scope").
		Preload("Resource").
		Preload("Action").
		Where("id = ?", id).
		First(&permission).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al obtener permiso por ID")
		return nil, err
	}

	entity := mappers.ToPermissionEntity(permission)
	return &entity, nil
}

// GetPermissionsByScopeID obtiene permisos por scope ID
func (r *Repository) GetPermissionsByScopeID(ctx context.Context, scopeID uint) ([]domain.Permission, error) {
	var permissions []models.Permission
	if err := r.database.Conn(ctx).
		Model(&models.Permission{}).
		Preload("Scope").
		Preload("Resource").
		Preload("Action").
		Where("scope_id = ?", scopeID).
		Find(&permissions).Error; err != nil {
		r.logger.Error().Uint("scope_id", scopeID).Err(err).Msg("Error al obtener permisos por scope ID")
		return nil, err
	}
	return mappers.ToPermissionEntitySlice(permissions), nil
}

// GetPermissionsByResource obtiene permisos por recurso
func (r *Repository) GetPermissionsByResource(ctx context.Context, resource string) ([]domain.Permission, error) {
	var permissions []models.Permission
	if err := r.database.Conn(ctx).
		Model(&models.Permission{}).
		Preload("Scope").
		Preload("Resource").
		Preload("Action").
		Joins("JOIN resource ON permission.resource_id = resource.id").
		Where("resource.name = ?", resource).
		Find(&permissions).Error; err != nil {
		r.logger.Error().Str("resource", resource).Err(err).Msg("Error al obtener permisos por recurso")
		return nil, err
	}
	return mappers.ToPermissionEntitySlice(permissions), nil
}

// CreatePermission crea un nuevo permiso
func (r *Repository) CreatePermission(ctx context.Context, permission domain.Permission) (string, error) {
	// Este método requiere lógica adicional para mapear nombres de recurso/acción a IDs
	// Por ahora, retornamos un error indicando que no está implementado
	return "", fmt.Errorf("método CreatePermission no implementado - requiere mapeo de nombres a IDs")
}

// UpdatePermission actualiza un permiso existente
func (r *Repository) UpdatePermission(ctx context.Context, id uint, permission domain.Permission) (string, error) {
	// Este método requiere lógica adicional para mapear nombres de recurso/acción a IDs
	// Por ahora, retornamos un error indicando que no está implementado
	return "", fmt.Errorf("método UpdatePermission no implementado - requiere mapeo de nombres a IDs")
}

// DeletePermission elimina un permiso
func (r *Repository) DeletePermission(ctx context.Context, id uint) (string, error) {
	if err := r.database.Conn(ctx).Delete(&models.Permission{}, id).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al eliminar permiso")
		return "", err
	}
	return fmt.Sprintf("Permiso eliminado con ID: %d", id), nil
}
