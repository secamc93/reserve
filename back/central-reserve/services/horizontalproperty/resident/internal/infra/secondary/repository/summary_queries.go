package repository

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/resident/internal/domain"
	"dbpostgres/app/infra/models"
)

// GetResidentsSummary cuenta los residentes de la propiedad (los que tienen unidad, igual que
// el listado) y los agrupa por tipo. Los tipos activos sin residentes vienen con total 0.
func (r *ResidentRepository) GetResidentsSummary(ctx context.Context, businessID uint) (*domain.ResidentsSummaryDTO, error) {
	var totals struct {
		Total        int64
		Active       int64
		Main         int64
		WithoutEmail int64
	}
	if err := r.db.Conn(ctx).Model(&models.Resident{}).
		Select("COUNT(DISTINCT residents.id) AS total, "+
			"COUNT(DISTINCT residents.id) FILTER (WHERE residents.is_active) AS active, "+
			"COUNT(DISTINCT residents.id) FILTER (WHERE resident_units.is_main_resident) AS main, "+
			"COUNT(DISTINCT residents.id) FILTER (WHERE COALESCE(residents.email, '') = '') AS without_email").
		Joins("JOIN horizontal_property.resident_units ON resident_units.resident_id = residents.id").
		Where("residents.business_id = ?", businessID).
		Scan(&totals).Error; err != nil {
		return nil, fmt.Errorf("error contando residentes: %w", err)
	}

	type typeRow struct {
		ResidentTypeID uint
		Name           string
		Code           string
		Total          int64
	}
	var rows []typeRow
	if err := r.db.Conn(ctx).Model(&models.ResidentType{}).
		Select("resident_types.id AS resident_type_id, resident_types.name, resident_types.code, "+
			"COUNT(DISTINCT residents.id) AS total").
		Joins("LEFT JOIN horizontal_property.residents ON residents.resident_type_id = resident_types.id "+
			"AND residents.business_id = ? AND residents.deleted_at IS NULL "+
			"AND EXISTS (SELECT 1 FROM horizontal_property.resident_units ru WHERE ru.resident_id = residents.id)", businessID).
		Where("resident_types.is_active = ?", true).
		Group("resident_types.id, resident_types.name, resident_types.code").
		Order("resident_types.id ASC").
		Scan(&rows).Error; err != nil {
		return nil, fmt.Errorf("error contando residentes por tipo: %w", err)
	}

	summary := &domain.ResidentsSummaryDTO{
		Total:        totals.Total,
		Active:       totals.Active,
		Inactive:     totals.Total - totals.Active,
		Main:         totals.Main,
		WithoutEmail: totals.WithoutEmail,
		Types:        make([]domain.ResidentTypeCountDTO, len(rows)),
	}
	for i, rw := range rows {
		summary.Types[i] = domain.ResidentTypeCountDTO{ResidentTypeID: rw.ResidentTypeID, Name: rw.Name, Code: rw.Code, Total: rw.Total}
	}
	return summary, nil
}
