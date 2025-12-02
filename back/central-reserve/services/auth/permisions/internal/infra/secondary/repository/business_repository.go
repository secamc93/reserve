package repository

import (
	"central_reserve/services/auth/permisions/internal/domain"
	"context"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

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
