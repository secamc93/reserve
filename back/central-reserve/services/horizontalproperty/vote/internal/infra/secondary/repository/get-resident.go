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
	// Struct temporal para recibir datos del JOIN
	var result struct {
		ID                 uint
		Name               string
		PropertyUnitID     uint
		PropertyUnitNumber string
	}

	// Buscar residente por DNI y verificar que esté asociado a la unidad
	err := r.db.Conn(ctx).
		Model(&models.Resident{}).
		Select("residents.id, residents.name, resident_units.property_unit_id, property_units.number as property_unit_number").
		Joins("JOIN horizontal_property.resident_units ON resident_units.resident_id = residents.id").
		Joins("JOIN horizontal_property.property_units ON property_units.id = resident_units.property_unit_id").
		Where("residents.business_id = ?", hpID).
		Where("residents.dni = ?", dni).
		Where("resident_units.property_unit_id = ?", propertyUnitID).
		Where("residents.is_active = ?", true).
		First(&result).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("residente no encontrado")
		}
		r.logger.Error().Err(err).Uint("hp_id", hpID).Uint("property_unit_id", propertyUnitID).Str("dni", dni).Msg("Error obteniendo residente")
		return nil, fmt.Errorf("error obteniendo residente: %w", err)
	}

	return &domain.ResidentBasicDTO{
		ID:                 result.ID,
		Name:               result.Name,
		PropertyUnitID:     result.PropertyUnitID,
		PropertyUnitNumber: result.PropertyUnitNumber,
	}, nil
}
