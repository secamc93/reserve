package repository

import (
	"central_reserve/services/auth/internal/domain"
	"central_reserve/services/auth/internal/infra/secondary/repository/mappers"
	"context"
	"dbpostgres/app/infra/models"
	"fmt"
)

// GetPermissions obtiene todos los permisos con filtros opcionales
func (r *Repository) GetPermissions(ctx context.Context, businessTypeID *uint, name *string, scopeID *uint) ([]domain.Permission, error) {
	var permissions []models.Permission
	query := r.database.Conn(ctx).
		Model(&models.Permission{}).
		Preload("Scope").
		Preload("Resource").
		Preload("Action").
		Preload("BusinessType")

	// Filtrar por business_type_id si se proporciona
	// Incluye permisos genéricos (NULL) o del tipo especificado
	if businessTypeID != nil {
		query = query.Where("business_type_id = ? OR business_type_id IS NULL", *businessTypeID)
	}

	// Filtrar por name (búsqueda parcial en resource.name)
	if name != nil && *name != "" {
		query = query.Joins("JOIN resource ON permission.resource_id = resource.id").
			Where("resource.name ILIKE ?", "%"+*name+"%")
	}

	// Filtrar por scope_id
	if scopeID != nil {
		query = query.Where("scope_id = ?", *scopeID)
	}

	if err := query.Find(&permissions).Error; err != nil {
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
	// Verificar que el Resource existe
	var resource models.Resource
	if err := r.database.Conn(ctx).Where("id = ?", permission.ResourceID).First(&resource).Error; err != nil {
		r.logger.Error().Uint("resource_id", permission.ResourceID).Err(err).Msg("Error al buscar resource")
		return "", fmt.Errorf("resource no encontrado con ID: %d", permission.ResourceID)
	}

	// Verificar que el Action existe
	var action models.Action
	if err := r.database.Conn(ctx).Where("id = ?", permission.ActionID).First(&action).Error; err != nil {
		r.logger.Error().Uint("action_id", permission.ActionID).Err(err).Msg("Error al buscar action")
		return "", fmt.Errorf("action no encontrada con ID: %d", permission.ActionID)
	}

	// Crear el modelo Permission
	permissionModel := models.Permission{
		ResourceID: permission.ResourceID,
		ActionID:   permission.ActionID,
		ScopeID:    permission.ScopeID,
	}

	// Agregar business_type_id si está presente
	if permission.BusinessTypeID > 0 {
		btID := permission.BusinessTypeID
		permissionModel.BusinessTypeID = &btID
	}

	if err := r.database.Conn(ctx).Create(&permissionModel).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al crear permiso")
		return "", err
	}

	r.logger.Info().
		Uint("permission_id", permissionModel.ID).
		Uint("resource_id", permission.ResourceID).
		Uint("action_id", permission.ActionID).
		Msg("Permiso creado exitosamente")

	return fmt.Sprintf("Permiso creado con ID: %d", permissionModel.ID), nil
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
