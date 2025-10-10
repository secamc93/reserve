package repository

import (
	"context"
	"dbpostgres/app/infra/models"
	"fmt"

	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/services/horizontalproperty/internal/infra/secondary/repository/mapper"

	"gorm.io/gorm"
)

// GetBusinessTypeByID obtiene un tipo de negocio por ID
func (r *Repository) GetBusinessTypeByID(ctx context.Context, id uint) (*domain.BusinessType, error) {
	var businessType models.BusinessType

	err := r.db.Conn(ctx).First(&businessType, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("tipo de negocio no encontrado")
		}
		r.logger.Error().Err(err).Uint("id", id).Msg("Error obteniendo tipo de negocio por ID")
		return nil, fmt.Errorf("error obteniendo tipo de negocio: %w", err)
	}

	return mapper.ToBusinessType(&businessType), nil
}

// GetHorizontalPropertyType obtiene el tipo de negocio de propiedad horizontal
func (r *Repository) GetHorizontalPropertyType(ctx context.Context) (*domain.BusinessType, error) {
	var businessType models.BusinessType

	err := r.db.Conn(ctx).Where("code = ?", "horizontal_property").First(&businessType).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("tipo de negocio de propiedad horizontal no encontrado")
		}
		r.logger.Error().Err(err).Msg("Error obteniendo tipo de negocio de propiedad horizontal")
		return nil, fmt.Errorf("error obteniendo tipo de negocio de propiedad horizontal: %w", err)
	}

	return mapper.ToBusinessType(&businessType), nil
}
