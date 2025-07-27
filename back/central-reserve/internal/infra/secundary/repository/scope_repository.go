package repository

import (
	"central_reserve/internal/domain/entities"
	"context"
	"fmt"
)

// ScopeRepository implementa ports.IScopeRepository

// GetScopes obtiene todos los scopes
func (r *Repository) GetScopes(ctx context.Context) ([]entities.Scope, error) {
	var scopes []entities.Scope
	if err := r.database.Conn(ctx).Table("scope").Find(&scopes).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al obtener scopes")
		return nil, err
	}
	return scopes, nil
}

// GetScopeByID obtiene un scope por su ID
func (r *Repository) GetScopeByID(ctx context.Context, id uint) (*entities.Scope, error) {
	var scope entities.Scope
	if err := r.database.Conn(ctx).Table("scope").Where("id = ?", id).First(&scope).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al obtener scope por ID")
		return nil, err
	}
	return &scope, nil
}

// GetScopeByCode obtiene un scope por su código
func (r *Repository) GetScopeByCode(ctx context.Context, code string) (*entities.Scope, error) {
	var scope entities.Scope
	if err := r.database.Conn(ctx).Table("scope").Where("code = ?", code).First(&scope).Error; err != nil {
		r.logger.Error().Str("code", code).Err(err).Msg("Error al obtener scope por código")
		return nil, err
	}
	return &scope, nil
}

// CreateScope crea un nuevo scope
func (r *Repository) CreateScope(ctx context.Context, scope entities.Scope) (string, error) {
	if err := r.database.Conn(ctx).Table("scope").Create(&scope).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al crear scope")
		return "", err
	}
	return fmt.Sprintf("Scope creado con ID: %d", scope.ID), nil
}

// UpdateScope actualiza un scope existente
func (r *Repository) UpdateScope(ctx context.Context, id uint, scope entities.Scope) (string, error) {
	if err := r.database.Conn(ctx).Table("scope").Where("id = ?", id).Updates(&scope).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al actualizar scope")
		return "", err
	}
	return fmt.Sprintf("Scope actualizado con ID: %d", id), nil
}

// DeleteScope elimina un scope
func (r *Repository) DeleteScope(ctx context.Context, id uint) (string, error) {
	if err := r.database.Conn(ctx).Table("scope").Where("id = ?", id).Delete(&entities.Scope{}).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al eliminar scope")
		return "", err
	}
	return fmt.Sprintf("Scope eliminado con ID: %d", id), nil
}
