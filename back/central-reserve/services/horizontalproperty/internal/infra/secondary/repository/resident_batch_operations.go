package repository

import (
	"context"
	"fmt"
	"strings"

	"central_reserve/services/horizontalproperty/internal/domain"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

// GetPropertyUnitsByNumbers obtiene un mapa de números de unidad a IDs en una sola query
// La búsqueda es insensible a mayúsculas y minúsculas
func (r *Repository) GetPropertyUnitsByNumbers(ctx context.Context, businessID uint, numbers []string) (map[string]uint, error) {
	if len(numbers) == 0 {
		return make(map[string]uint), nil
	}

	// Convertir todos los números a minúsculas para la búsqueda
	lowerNumbers := make([]string, len(numbers))
	for i, num := range numbers {
		lowerNumbers[i] = strings.ToLower(strings.TrimSpace(num))
	}

	var units []models.PropertyUnit
	err := r.db.Conn(ctx).
		Select("id, number").
		Where("business_id = ? AND LOWER(number) IN ? AND is_active = ?", businessID, lowerNumbers, true).
		Find(&units).Error

	if err != nil {
		return nil, fmt.Errorf("error obteniendo unidades por números: %w", err)
	}

	// Crear mapa de number -> id (usando el número original como clave)
	unitMap := make(map[string]uint, len(units))
	for _, unit := range units {
		// Buscar el número original que coincide (insensible a mayúsculas)
		for _, originalNum := range numbers {
			if strings.EqualFold(strings.TrimSpace(originalNum), unit.Number) {
				unitMap[originalNum] = unit.ID
				break
			}
		}
	}

	return unitMap, nil
}

// GetMainResidentsByUnitIDs trae residentes principales por IDs de unidades en un solo query y los mapea por unitID
func (r *Repository) GetMainResidentsByUnitIDs(ctx context.Context, businessID uint, unitIDs []uint) (map[uint]domain.ResidentDetailDTO, error) {
	result := make(map[uint]domain.ResidentDetailDTO)
	if len(unitIDs) == 0 {
		return result, nil
	}

	var residents []models.Resident
	if err := r.db.Conn(ctx).
		Preload("PropertyUnit").
		Where("business_id = ? AND property_unit_id IN ? AND is_main_resident = ? AND is_active = ?", businessID, unitIDs, true, true).
		Find(&residents).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo residentes principales: %w", err)
	}

	for _, m := range residents {
		result[m.PropertyUnitID] = domain.ResidentDetailDTO{
			ID:                 m.ID,
			BusinessID:         m.BusinessID,
			PropertyUnitID:     m.PropertyUnitID,
			PropertyUnitNumber: m.PropertyUnit.Number,
			ResidentTypeID:     m.ResidentTypeID,
			Name:               m.Name,
			Email:              m.Email,
			Phone:              m.Phone,
			Dni:                m.Dni,
			IsMainResident:     m.IsMainResident,
			IsActive:           m.IsActive,
			CreatedAt:          m.CreatedAt,
			UpdatedAt:          m.UpdatedAt,
		}
	}
	return result, nil
}

// UpdateResidentsInBatch actualiza múltiples residentes en una sola transacción
func (r *Repository) UpdateResidentsInBatch(ctx context.Context, pairs []domain.ResidentUpdatePair) error {
	if len(pairs) == 0 {
		return nil
	}
	return r.db.Conn(ctx).Transaction(func(tx *gorm.DB) error {
		for _, p := range pairs {
			updates := map[string]interface{}{}
			if p.UpdateDTO.Name != nil {
				updates["name"] = *p.UpdateDTO.Name
			}
			if p.UpdateDTO.Dni != nil {
				updates["dni"] = *p.UpdateDTO.Dni
			}
			if len(updates) == 0 {
				continue
			}
			if err := tx.Model(&models.Resident{}).Where("id = ?", p.ID).Updates(updates).Error; err != nil {
				return fmt.Errorf("error actualizando residente %d: %w", p.ID, err)
			}
		}
		return nil
	})
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
