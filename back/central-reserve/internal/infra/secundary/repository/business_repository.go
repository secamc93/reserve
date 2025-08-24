package repository

import (
	"central_reserve/internal/domain/entities"
	"central_reserve/internal/infra/secundary/repository/mapper"
	"context"
	"dbpostgres/app/infra/models"
	"fmt"
)

// BusinessRepository implementa ports.IBusinessRepository

// GetBusinesses obtiene todos los negocios
func (r *Repository) GetBusinesses(ctx context.Context) ([]entities.Business, error) {
	var businesses []models.Business
	if err := r.database.Conn(ctx).
		Model(&models.Business{}).
		Preload("BusinessType").
		Find(&businesses).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al obtener negocios")
		return nil, err
	}
	return mapper.ToBusinessEntitySlice(businesses), nil
}

// GetBusinessByID obtiene un negocio por su ID
func (r *Repository) GetBusinessByID(ctx context.Context, id uint) (*entities.Business, error) {
	var business models.Business
	if err := r.database.Conn(ctx).
		Model(&models.Business{}).
		Preload("BusinessType").
		Where("id = ?", id).
		First(&business).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al obtener negocio por ID")
		return nil, err
	}

	entity := mapper.ToBusinessEntity(business)
	return &entity, nil
}

// GetBusinessByCode obtiene un negocio por su código
func (r *Repository) GetBusinessByCode(ctx context.Context, code string) (*entities.Business, error) {
	var business models.Business
	if err := r.database.Conn(ctx).
		Model(&models.Business{}).
		Preload("BusinessType").
		Where("code = ?", code).
		First(&business).Error; err != nil {
		r.logger.Error().Str("code", code).Err(err).Msg("Error al obtener negocio por código")
		return nil, err
	}

	entity := mapper.ToBusinessEntity(business)
	return &entity, nil
}

// GetBusinessByCustomDomain obtiene un negocio por su dominio personalizado
func (r *Repository) GetBusinessByCustomDomain(ctx context.Context, domain string) (*entities.Business, error) {
	var business models.Business
	if err := r.database.Conn(ctx).
		Model(&models.Business{}).
		Preload("BusinessType").
		Where("custom_domain = ?", domain).
		First(&business).Error; err != nil {
		r.logger.Error().Str("domain", domain).Err(err).Msg("Error al obtener negocio por dominio personalizado")
		return nil, err
	}

	entity := mapper.ToBusinessEntity(business)
	return &entity, nil
}

// CreateBusiness crea un nuevo negocio
func (r *Repository) CreateBusiness(ctx context.Context, business entities.Business) (string, error) {
	businessModel := mapper.ToBusinessModel(business)

	if err := r.database.Conn(ctx).Create(&businessModel).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al crear negocio")
		return "", err
	}
	return fmt.Sprintf("Negocio creado con ID: %d", businessModel.ID), nil
}

// UpdateBusiness actualiza un negocio existente
func (r *Repository) UpdateBusiness(ctx context.Context, id uint, business entities.Business) (string, error) {
	businessModel := mapper.ToBusinessModel(business)

	if err := r.database.Conn(ctx).
		Model(&models.Business{}).
		Where("id = ?", id).
		Updates(&businessModel).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al actualizar negocio")
		return "", err
	}
	return fmt.Sprintf("Negocio actualizado con ID: %d", id), nil
}

// DeleteBusiness elimina un negocio
func (r *Repository) DeleteBusiness(ctx context.Context, id uint) (string, error) {
	if err := r.database.Conn(ctx).Delete(&models.Business{}, id).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al eliminar negocio")
		return "", err
	}
	return fmt.Sprintf("Negocio eliminado con ID: %d", id), nil
}

// GetBusinesResourcesConfigured obtiene todos los recursos permitidos para un negocio con su estado de configuración
func (r *Repository) GetBusinesResourcesConfigured(ctx context.Context, businessID uint) ([]entities.BusinessResourceConfigured, error) {
	// Primero obtener el negocio para saber su tipo
	var business models.Business
	if err := r.database.Conn(ctx).
		Model(&models.Business{}).
		Where("id = ?", businessID).
		First(&business).Error; err != nil {
		r.logger.Error().Uint("business_id", businessID).Err(err).Msg("Error al obtener negocio")
		return nil, err
	}

	// Obtener todos los recursos permitidos para el tipo de negocio
	var permittedResources []models.BusinessTypeResourcePermitted
	if err := r.database.Conn(ctx).
		Model(&models.BusinessTypeResourcePermitted{}).
		Preload("Resource").
		Where("business_type_id = ?", business.BusinessTypeID).
		Find(&permittedResources).Error; err != nil {
		r.logger.Error().Err(err).Uint("business_type_id", business.BusinessTypeID).Msg("Error al obtener recursos permitidos")
		return nil, err
	}

	// Obtener recursos configurados para este negocio
	var configuredResources []models.BusinessResourceConfigured
	if err := r.database.Conn(ctx).
		Model(&models.BusinessResourceConfigured{}).
		Preload("BusinessTypeResourcePermitted.Resource").
		Where("business_id = ?", businessID).
		Find(&configuredResources).Error; err != nil {
		r.logger.Error().Err(err).Uint("business_id", businessID).Msg("Error al obtener recursos configurados")
		return nil, err
	}

	// Crear mapa de recursos configurados para búsqueda rápida
	configuredMap := make(map[uint]bool)
	for _, configured := range configuredResources {
		configuredMap[configured.BusinessTypeResourcePermitted.ResourceID] = true
	}

	// Construir respuesta combinando recursos permitidos con estado de configuración
	var result []entities.BusinessResourceConfigured
	for _, permitted := range permittedResources {
		isActive := configuredMap[permitted.ResourceID]

		entity := entities.BusinessResourceConfigured{
			ResourceID:   permitted.ResourceID,
			ResourceName: permitted.Resource.Name,
			IsActive:     isActive,
		}
		result = append(result, entity)
	}

	return result, nil
}
