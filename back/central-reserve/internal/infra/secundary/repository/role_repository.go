package repository

import (
	"central_reserve/internal/domain/entities"
	"context"
)

// RoleRepository implementa el repositorio de roles

// GetRoles obtiene todos los roles
func (r *Repository) GetRoles(ctx context.Context) ([]entities.Role, error) {
	var roles []entities.Role
	if err := r.database.Conn(ctx).
		Table("role").
		Select("role.*, scope.name as scope_name, scope.code as scope_code").
		Joins("LEFT JOIN scope ON role.scope_id = scope.id").
		Find(&roles).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al obtener roles")
		return nil, err
	}
	return roles, nil
}

// GetRoleByID obtiene un rol por su ID
func (r *Repository) GetRoleByID(ctx context.Context, id uint) (*entities.Role, error) {
	var role entities.Role
	if err := r.database.Conn(ctx).
		Table("role").
		Select("role.*, scope.name as scope_name, scope.code as scope_code").
		Joins("LEFT JOIN scope ON role.scope_id = scope.id").
		Where("role.id = ?", id).
		First(&role).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al obtener rol por ID")
		return nil, err
	}
	return &role, nil
}

// GetRolesByScopeID obtiene roles por scope ID
func (r *Repository) GetRolesByScopeID(ctx context.Context, scopeID uint) ([]entities.Role, error) {
	var roles []entities.Role
	if err := r.database.Conn(ctx).
		Table("role").
		Select("role.*, scope.name as scope_name, scope.code as scope_code").
		Joins("LEFT JOIN scope ON role.scope_id = scope.id").
		Where("role.scope_id = ?", scopeID).
		Find(&roles).Error; err != nil {
		r.logger.Error().Uint("scope_id", scopeID).Err(err).Msg("Error al obtener roles por scope ID")
		return nil, err
	}
	return roles, nil
}

// GetRolesByLevel obtiene roles por nivel
func (r *Repository) GetRolesByLevel(ctx context.Context, level int) ([]entities.Role, error) {
	var roles []entities.Role
	if err := r.database.Conn(ctx).
		Table("role").
		Select("role.*, scope.name as scope_name, scope.code as scope_code").
		Joins("LEFT JOIN scope ON role.scope_id = scope.id").
		Where("role.level = ?", level).
		Find(&roles).Error; err != nil {
		r.logger.Error().Int("level", level).Err(err).Msg("Error al obtener roles por nivel")
		return nil, err
	}
	return roles, nil
}

// GetSystemRoles obtiene solo los roles del sistema
func (r *Repository) GetSystemRoles(ctx context.Context) ([]entities.Role, error) {
	var roles []entities.Role
	if err := r.database.Conn(ctx).
		Table("role").
		Select("role.*, scope.name as scope_name, scope.code as scope_code").
		Joins("LEFT JOIN scope ON role.scope_id = scope.id").
		Where("role.is_system = ?", true).
		Find(&roles).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al obtener roles del sistema")
		return nil, err
	}
	return roles, nil
}
