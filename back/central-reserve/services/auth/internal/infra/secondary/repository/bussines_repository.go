package repository

import (
	"central_reserve/services/auth/internal/domain"
	"context"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

func (r *Repository) GetBusinessByID(ctx context.Context, businessID uint) (*domain.BusinessInfo, error) {
	var business models.Business

	err := r.database.Conn(ctx).
		Preload("BusinessType").
		Where("id = ?", businessID).
		First(&business).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			r.logger.Warn().Uint("business_id", businessID).Msg("Business no encontrado")
			return nil, nil
		}
		r.logger.Error().Uint("business_id", businessID).Err(err).Msg("Error al obtener business por ID")
		return nil, err
	}

	return &domain.BusinessInfo{
		ID:             business.ID,
		Name:           business.Name,
		Code:           business.Code,
		BusinessTypeID: business.BusinessTypeID,
		BusinessType: domain.BusinessTypeInfo{
			ID:          business.BusinessType.ID,
			Name:        business.BusinessType.Name,
			Code:        business.BusinessType.Code,
			Description: business.BusinessType.Description,
			Icon:        business.BusinessType.Icon,
		},
	}, nil
}

// GetBusinessTypeByID obtiene información del tipo de business por ID
func (r *Repository) GetBusinessTypeByID(ctx context.Context, businessTypeID uint) (*domain.BusinessTypeInfo, error) {
	var businessType models.BusinessType

	err := r.database.Conn(ctx).
		Where("id = ?", businessTypeID).
		First(&businessType).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			r.logger.Warn().Uint("business_type_id", businessTypeID).Msg("BusinessType no encontrado")
			return nil, nil
		}
		r.logger.Error().Uint("business_type_id", businessTypeID).Err(err).Msg("Error al obtener business type por ID")
		return nil, err
	}

	return &domain.BusinessTypeInfo{
		ID:   businessType.ID,
		Name: businessType.Name,
		Code: businessType.Code,
	}, nil
}
