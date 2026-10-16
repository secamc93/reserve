package repository

import (
	"context"
	"fmt"
	"strings"

	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"dbpostgres/app/infra/models"
)

// ============================================
// MÉTODOS DE CONSULTA A UNIDADES
// (Replicados localmente - no compartir repos)
// ============================================

// SearchUnits busca unidades activas de la propiedad por número o bloque, para elegir la
// unidad de una reserva ("Casa 126").
//
// Tabla consultada: property_units (gestionada por el módulo unit)
func (r *CommonAreaRepository) SearchUnits(ctx context.Context, businessID uint, search string, limit int) ([]domain.UnitLookupDTO, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}

	query := r.db.Conn(ctx).
		Model(&models.PropertyUnit{}).
		Where("business_id = ? AND is_active = ?", businessID, true)

	if term := strings.TrimSpace(search); term != "" {
		like := "%" + term + "%"
		query = query.Where("(number ILIKE ? OR block ILIKE ? OR CONCAT(block, ' ', number) ILIKE ?)", like, like, like)
	}

	var units []models.PropertyUnit
	if err := query.Order("block ASC, number ASC").Limit(limit).Find(&units).Error; err != nil {
		return nil, fmt.Errorf("error buscando unidades: %w", err)
	}

	result := make([]domain.UnitLookupDTO, len(units))
	for i, u := range units {
		result[i] = domain.UnitLookupDTO{ID: u.ID, Number: u.Number, Block: u.Block}
	}
	return result, nil
}
