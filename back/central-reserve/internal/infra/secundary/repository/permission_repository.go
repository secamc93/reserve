package repository

import (
	"central_reserve/internal/domain/entities"
	"central_reserve/internal/domain/ports"
	"central_reserve/internal/infra/secundary/repository/db"
	"central_reserve/internal/pkg/log"
	"context"
	"fmt"
)

// PermissionRepository implementa ports.IPermissionRepository
type PermissionRepository struct {
	database db.IDatabase
	logger   log.ILogger
}

// NewPermissionRepository crea una nueva instancia del repositorio de permisos
func NewPermissionRepository(database db.IDatabase, logger log.ILogger) ports.IPermissionRepository {
	return &PermissionRepository{
		database: database,
		logger:   logger,
	}
}

// GetPermissions obtiene todos los permisos
func (r *PermissionRepository) GetPermissions(ctx context.Context) ([]entities.Permission, error) {
	var permissions []entities.Permission
	if err := r.database.Conn(ctx).
		Table("permission").
		Select("permission.*, scope.name as scope_name, scope.code as scope_code").
		Joins("LEFT JOIN scope ON permission.scope_id = scope.id").
		Find(&permissions).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al obtener permisos")
		return nil, err
	}
	return permissions, nil
}

// GetPermissionByID obtiene un permiso por su ID
func (r *PermissionRepository) GetPermissionByID(ctx context.Context, id uint) (*entities.Permission, error) {
	var permission entities.Permission
	if err := r.database.Conn(ctx).
		Table("permission").
		Select("permission.*, scope.name as scope_name, scope.code as scope_code").
		Joins("LEFT JOIN scope ON permission.scope_id = scope.id").
		Where("permission.id = ?", id).
		First(&permission).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al obtener permiso por ID")
		return nil, err
	}
	return &permission, nil
}

// GetPermissionByCode obtiene un permiso por su código
func (r *PermissionRepository) GetPermissionByCode(ctx context.Context, code string) (*entities.Permission, error) {
	var permission entities.Permission
	if err := r.database.Conn(ctx).Table("permission").Where("code = ?", code).First(&permission).Error; err != nil {
		r.logger.Error().Str("code", code).Err(err).Msg("Error al obtener permiso por código")
		return nil, err
	}
	return &permission, nil
}

// GetPermissionsByScopeID obtiene permisos por scope ID
func (r *PermissionRepository) GetPermissionsByScopeID(ctx context.Context, scopeID uint) ([]entities.Permission, error) {
	var permissions []entities.Permission
	if err := r.database.Conn(ctx).
		Table("permission").
		Select("permission.*, scope.name as scope_name, scope.code as scope_code").
		Joins("LEFT JOIN scope ON permission.scope_id = scope.id").
		Where("permission.scope_id = ?", scopeID).
		Find(&permissions).Error; err != nil {
		r.logger.Error().Uint("scope_id", scopeID).Err(err).Msg("Error al obtener permisos por scope ID")
		return nil, err
	}
	return permissions, nil
}

// GetPermissionsByResource obtiene permisos por recurso
func (r *PermissionRepository) GetPermissionsByResource(ctx context.Context, resource string) ([]entities.Permission, error) {
	var permissions []entities.Permission
	if err := r.database.Conn(ctx).
		Table("permission").
		Select("permission.*, scope.name as scope_name, scope.code as scope_code").
		Joins("LEFT JOIN scope ON permission.scope_id = scope.id").
		Where("permission.resource = ?", resource).
		Find(&permissions).Error; err != nil {
		r.logger.Error().Str("resource", resource).Err(err).Msg("Error al obtener permisos por recurso")
		return nil, err
	}
	return permissions, nil
}

// CreatePermission crea un nuevo permiso
func (r *PermissionRepository) CreatePermission(ctx context.Context, permission entities.Permission) (string, error) {
	if err := r.database.Conn(ctx).Table("permission").Create(&permission).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al crear permiso")
		return "", err
	}
	return fmt.Sprintf("Permiso creado con ID: %d", permission.ID), nil
}

// UpdatePermission actualiza un permiso existente
func (r *PermissionRepository) UpdatePermission(ctx context.Context, id uint, permission entities.Permission) (string, error) {
	if err := r.database.Conn(ctx).Table("permission").Where("id = ?", id).Updates(&permission).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al actualizar permiso")
		return "", err
	}
	return fmt.Sprintf("Permiso actualizado con ID: %d", id), nil
}

// DeletePermission elimina un permiso
func (r *PermissionRepository) DeletePermission(ctx context.Context, id uint) (string, error) {
	if err := r.database.Conn(ctx).Table("permission").Where("id = ?", id).Delete(&entities.Permission{}).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al eliminar permiso")
		return "", err
	}
	return fmt.Sprintf("Permiso eliminado con ID: %d", id), nil
}
