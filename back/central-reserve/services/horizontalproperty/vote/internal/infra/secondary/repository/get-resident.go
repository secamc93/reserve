package repository

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

// GetResidentByUnitAndDni obtiene un residente por unidad y DNI
func (r *Repository) GetResidentByUnitAndDni(ctx context.Context, hpID, propertyUnitID uint, dni string) (*domain.ResidentBasicDTO, error) {
	var resident models.Resident

	// Buscar residente por DNI y verificar que esté asociado a la unidad
	err := r.db.Conn(ctx).
		Table("horizontal_property.residents r").
		Select("r.id, r.name").
		Joins("JOIN horizontal_property.resident_units ru ON ru.resident_id = r.id").
		Where("r.business_id = ?", hpID).
		Where("r.dni = ?", dni).
		Where("ru.property_unit_id = ?", propertyUnitID).
		Where("r.is_active = ?", true).
		First(&resident).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("residente no encontrado")
		}
		r.logger.Error().Err(err).Uint("hp_id", hpID).Uint("property_unit_id", propertyUnitID).Str("dni", dni).Msg("Error obteniendo residente")
		return nil, fmt.Errorf("error obteniendo residente: %w", err)
	}

	return &domain.ResidentBasicDTO{
		ID:   resident.ID,
		Name: resident.Name,
	}, nil
}
