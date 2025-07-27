package repository

import (
	"central_reserve/internal/domain/entities"
	"context"
	"fmt"
)

// BusinessRepository implementa ports.IBusinessRepository

// GetBusinesses obtiene todos los negocios
func (r *Repository) GetBusinesses(ctx context.Context) ([]entities.Business, error) {
	var businesses []entities.Business
	if err := r.database.Conn(ctx).Table("business").Find(&businesses).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al obtener negocios")
		return nil, err
	}
	return businesses, nil
}

// GetBusinessByID obtiene un negocio por su ID
func (r *Repository) GetBusinessByID(ctx context.Context, id uint) (*entities.Business, error) {
	var business entities.Business
	if err := r.database.Conn(ctx).Table("business").Where("id = ?", id).First(&business).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al obtener negocio por ID")
		return nil, err
	}
	return &business, nil
}

// GetBusinessByCode obtiene un negocio por su código
func (r *Repository) GetBusinessByCode(ctx context.Context, code string) (*entities.Business, error) {
	var business entities.Business
	if err := r.database.Conn(ctx).Table("business").Where("code = ?", code).First(&business).Error; err != nil {
		r.logger.Error().Str("code", code).Err(err).Msg("Error al obtener negocio por código")
		return nil, err
	}
	return &business, nil
}

// GetBusinessByCustomDomain obtiene un negocio por su dominio personalizado
func (r *Repository) GetBusinessByCustomDomain(ctx context.Context, domain string) (*entities.Business, error) {
	var business entities.Business
	if err := r.database.Conn(ctx).Table("business").Where("custom_domain = ?", domain).First(&business).Error; err != nil {
		r.logger.Error().Str("domain", domain).Err(err).Msg("Error al obtener negocio por dominio personalizado")
		return nil, err
	}
	return &business, nil
}

// CreateBusiness crea un nuevo negocio
func (r *Repository) CreateBusiness(ctx context.Context, business entities.Business) (string, error) {
	if err := r.database.Conn(ctx).Table("business").Create(&business).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al crear negocio")
		return "", err
	}
	return fmt.Sprintf("Negocio creado con ID: %d", business.ID), nil
}

// UpdateBusiness actualiza un negocio existente
func (r *Repository) UpdateBusiness(ctx context.Context, id uint, business entities.Business) (string, error) {
	if err := r.database.Conn(ctx).Table("business").Where("id = ?", id).Updates(&business).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al actualizar negocio")
		return "", err
	}
	return fmt.Sprintf("Negocio actualizado con ID: %d", id), nil
}

// DeleteBusiness elimina un negocio
func (r *Repository) DeleteBusiness(ctx context.Context, id uint) (string, error) {
	if err := r.database.Conn(ctx).Table("business").Where("id = ?", id).Delete(&entities.Business{}).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al eliminar negocio")
		return "", err
	}
	return fmt.Sprintf("Negocio eliminado con ID: %d", id), nil
}
