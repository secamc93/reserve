package repository

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/unit/internal/domain"
	"dbpostgres/app/infra/models"
)

// GetPropertyUnitsSummary agrupa las unidades de la propiedad por bloque con su conteo y la
// suma de coeficientes, y cuenta cuántas unidades tienen al menos un residente.
func (r *PropertyUnitRepository) GetPropertyUnitsSummary(ctx context.Context, businessID uint) (*domain.PropertyUnitsSummaryDTO, error) {
	type blockRow struct {
		Block          string
		Total          int64
		Active         int64
		Commercial     int64
		CoefficientSum float64
	}
	var rows []blockRow
	if err := r.db.Conn(ctx).Model(&models.PropertyUnit{}).
		Select("COALESCE(block, '') AS block, COUNT(*) AS total, "+
			"COUNT(*) FILTER (WHERE is_active) AS active, "+
			"COUNT(*) FILTER (WHERE unit_type = 'commercial') AS commercial, "+
			"COALESCE(SUM(participation_coefficient), 0) AS coefficient_sum").
		Where("business_id = ?", businessID).
		Group("COALESCE(block, '')").
		Order("COALESCE(block, '') ASC").
		Scan(&rows).Error; err != nil {
		return nil, fmt.Errorf("error resumiendo unidades: %w", err)
	}

	summary := &domain.PropertyUnitsSummaryDTO{Blocks: make([]domain.PropertyUnitBlockSummaryDTO, len(rows))}
	for i, rw := range rows {
		summary.Blocks[i] = domain.PropertyUnitBlockSummaryDTO{
			Block: rw.Block, Total: rw.Total, Active: rw.Active, CoefficientSum: rw.CoefficientSum,
		}
		summary.Total += rw.Total
		summary.Active += rw.Active
		summary.Commercial += rw.Commercial
		summary.CoefficientSum += rw.CoefficientSum
	}

	withResidents, err := r.countUnitsWithResidents(ctx, businessID)
	if err != nil {
		return nil, err
	}
	summary.WithResidents = withResidents
	return summary, nil
}

// ListExistingUnits devuelve número, id y coeficiente de todas las unidades de la propiedad
// (para cruzar con un archivo de importación).
func (r *PropertyUnitRepository) ListExistingUnits(ctx context.Context, businessID uint) ([]domain.ExistingUnitDTO, error) {
	var ms []models.PropertyUnit
	if err := r.db.Conn(ctx).Model(&models.PropertyUnit{}).
		Select("id", "number", "participation_coefficient").
		Where("business_id = ?", businessID).
		Find(&ms).Error; err != nil {
		return nil, fmt.Errorf("error listando unidades existentes: %w", err)
	}
	out := make([]domain.ExistingUnitDTO, len(ms))
	for i, m := range ms {
		coef := 0.0
		if m.ParticipationCoefficient != nil {
			coef = *m.ParticipationCoefficient
		}
		out[i] = domain.ExistingUnitDTO{ID: m.ID, Number: m.Number, Coefficient: coef}
	}
	return out, nil
}
