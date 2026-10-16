package repository

// ============================================
// MÉTODOS DE CONSULTA A TABLAS DE RESIDENTES
// (Replicados localmente - no compartir repos)
// Tablas consultadas: resident_units y residents (gestionadas por el módulo resident).
// Solo lectura.
// ============================================

import (
	"context"
	"fmt"

	"dbpostgres/app/infra/models"
)

// unitOccupancy es la ocupación de una unidad: cuántos residentes tiene y el nombre del
// residente principal (o el primero por nombre si ninguno está marcado como principal).
type unitOccupancy struct {
	PropertyUnitID   uint
	ResidentsCount   int
	MainResidentName string
}

// getOccupancyByUnitIDs devuelve la ocupación de las unidades indicadas (map[unit_id]).
func (r *PropertyUnitRepository) getOccupancyByUnitIDs(ctx context.Context, unitIDs []uint) (map[uint]unitOccupancy, error) {
	result := make(map[uint]unitOccupancy, len(unitIDs))
	if len(unitIDs) == 0 {
		return result, nil
	}
	var rows []unitOccupancy
	if err := r.db.Conn(ctx).Model(&models.ResidentUnit{}).
		Select("resident_units.property_unit_id, COUNT(DISTINCT residents.id) AS residents_count, "+
			"COALESCE(MAX(CASE WHEN resident_units.is_main_resident THEN residents.name END), MIN(residents.name), '') AS main_resident_name").
		Joins("JOIN horizontal_property.residents ON residents.id = resident_units.resident_id AND residents.deleted_at IS NULL").
		Where("resident_units.property_unit_id IN ?", unitIDs).
		Group("resident_units.property_unit_id").
		Scan(&rows).Error; err != nil {
		return nil, fmt.Errorf("error consultando ocupación de unidades: %w", err)
	}
	for _, rw := range rows {
		result[rw.PropertyUnitID] = rw
	}
	return result, nil
}

// countUnitsWithResidents cuenta las unidades de la propiedad con al menos un residente.
func (r *PropertyUnitRepository) countUnitsWithResidents(ctx context.Context, businessID uint) (int64, error) {
	var count int64
	if err := r.db.Conn(ctx).Model(&models.ResidentUnit{}).
		Joins("JOIN horizontal_property.residents ON residents.id = resident_units.resident_id AND residents.deleted_at IS NULL").
		Joins("JOIN horizontal_property.property_units ON property_units.id = resident_units.property_unit_id AND property_units.deleted_at IS NULL").
		Where("property_units.business_id = ?", businessID).
		Distinct("resident_units.property_unit_id").
		Count(&count).Error; err != nil {
		return 0, fmt.Errorf("error contando unidades con residentes: %w", err)
	}
	return count, nil
}
