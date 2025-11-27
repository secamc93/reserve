package repository

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

// GetHorizontalPropertyBasicInfo obtiene información básica de una propiedad horizontal
func (r *Repository) GetHorizontalPropertyBasicInfo(ctx context.Context, hpID uint) (*domain.HorizontalPropertyDTO, error) {
	var hp models.Business
	if err := r.db.Conn(ctx).First(&hp, hpID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("propiedad horizontal no encontrada")
		}
		r.logger.Error().Err(err).Uint("hp_id", hpID).Msg("Error obteniendo propiedad horizontal")
		return nil, fmt.Errorf("error obteniendo propiedad horizontal: %w", err)
	}

	return &domain.HorizontalPropertyDTO{
		ID:      hp.ID,
		Name:    hp.Name,
		Address: hp.Address,
	}, nil
}
