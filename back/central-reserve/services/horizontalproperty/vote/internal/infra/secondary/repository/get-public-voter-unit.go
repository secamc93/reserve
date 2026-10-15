package repository

import (
	"context"
	"errors"
	"fmt"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

// GetPublicVoterUnit obtiene una unidad de la propiedad hpID con su residente activo (el
// principal primero). Se usa en el voto público por QR cuando el grupo no exige documento.
func (r *Repository) GetPublicVoterUnit(ctx context.Context, hpID, propertyUnitID uint) (*domain.PublicVoterUnitDTO, error) {
	var unit models.PropertyUnit
	err := r.db.Conn(ctx).
		Where("id = ? AND business_id = ?", propertyUnitID, hpID).
		First(&unit).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domain.ErrPropertyUnitNotFound
		}
		r.logger.Error().Err(err).Uint("hp_id", hpID).Uint("property_unit_id", propertyUnitID).Msg("Error obteniendo unidad para voto público")
		return nil, fmt.Errorf("error obteniendo unidad: %w", err)
	}

	result := &domain.PublicVoterUnitDTO{
		PropertyUnitID:     unit.ID,
		PropertyUnitNumber: unit.Number,
		IsActive:           unit.IsActive,
	}

	var resident struct {
		ID   uint
		Name string
	}
	err = r.db.Conn(ctx).
		Model(&models.Resident{}).
		Select("residents.id, residents.name").
		Joins("JOIN horizontal_property.resident_units ON resident_units.resident_id = residents.id AND resident_units.deleted_at IS NULL").
		Where("resident_units.property_unit_id = ?", unit.ID).
		Where("residents.business_id = ?", hpID).
		Where("residents.is_active = ?", true).
		Order("resident_units.is_main_resident DESC, residents.id ASC").
		Limit(1).
		Scan(&resident).Error
	if err != nil {
		r.logger.Error().Err(err).Uint("property_unit_id", unit.ID).Msg("Error obteniendo residente de la unidad para voto público")
		return nil, fmt.Errorf("error obteniendo residente de la unidad: %w", err)
	}
	result.ResidentID = resident.ID
	result.ResidentName = resident.Name
	return result, nil
}
