package repository

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/internal/domain"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

// GetPropertyUnitsByNumbers obtiene un mapa de números de unidad a IDs en una sola query
func (r *Repository) GetPropertyUnitsByNumbers(ctx context.Context, businessID uint, numbers []string) (map[string]uint, error) {
	if len(numbers) == 0 {
		return make(map[string]uint), nil
	}

	var units []models.PropertyUnit
	err := r.db.Conn(ctx).
		Select("id, number").
		Where("business_id = ? AND number IN ? AND is_active = ?", businessID, numbers, true).
		Find(&units).Error

	if err != nil {
		return nil, fmt.Errorf("error obteniendo unidades por números: %w", err)
	}

	// Crear mapa de number -> id
	unitMap := make(map[string]uint, len(units))
	for _, unit := range units {
		unitMap[unit.Number] = unit.ID
	}

	return unitMap, nil
}

// CreateResidentsInBatch crea múltiples residentes en una sola transacción
func (r *Repository) CreateResidentsInBatch(ctx context.Context, residents []*domain.Resident) error {
	if len(residents) == 0 {
		return nil
	}

	// Convertir domain entities a models
	residentModels := make([]*models.Resident, len(residents))
	for i, res := range residents {
		residentModels[i] = &models.Resident{
			BusinessID:       res.BusinessID,
			PropertyUnitID:   res.PropertyUnitID,
			ResidentTypeID:   res.ResidentTypeID,
			Name:             res.Name,
			Email:            res.Email,
			Phone:            res.Phone,
			Dni:              res.Dni,
			EmergencyContact: res.EmergencyContact,
			IsMainResident:   res.IsMainResident,
			IsActive:         res.IsActive,
			MoveInDate:       res.MoveInDate,
		}
	}

	// Usar transacción para crear todos o ninguno
	return r.db.Conn(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.CreateInBatches(residentModels, 100).Error; err != nil {
			return fmt.Errorf("error creando residentes en batch: %w", err)
		}
		return nil
	})
}
