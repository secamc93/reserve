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

	// Consultar por pivote resident_units
	type row struct {
		UnitID         uint
		UnitNumber     string
		ResidentID     uint
		BusinessID     uint
		ResidentTypeID uint
		Name           string
		Email          string
		Phone          string
		Dni            string
		IsActive       bool
		IsMainResident bool
		CreatedAtUnix  int64
		UpdatedAtUnix  int64
	}
	rows := []row{}
	if err := r.db.Conn(ctx).Table("horizontal_property.resident_units ru").
		Select("ru.property_unit_id as unit_id, pu.number as unit_number, r.id as resident_id, r.business_id, r.resident_type_id, r.name, r.email, r.phone, r.dni, r.is_active, ru.is_main_resident, EXTRACT(EPOCH FROM r.created_at)::bigint as created_at_unix, EXTRACT(EPOCH FROM r.updated_at)::bigint as updated_at_unix").
		Joins("JOIN horizontal_property.property_units pu ON pu.id = ru.property_unit_id").
		Joins("JOIN horizontal_property.residents r ON r.id = ru.resident_id").
		Where("r.business_id = ? AND ru.property_unit_id IN ? AND r.is_active = ?", businessID, unitIDs, true).
		Where("ru.is_main_resident = ?", true).
		Scan(&rows).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo residentes principales: %w", err)
	}

	for _, rw := range rows {
		result[rw.UnitID] = domain.ResidentDetailDTO{
			ID:                 rw.ResidentID,
			BusinessID:         rw.BusinessID,
			PropertyUnitID:     rw.UnitID,
			PropertyUnitNumber: rw.UnitNumber,
			ResidentTypeID:     rw.ResidentTypeID,
			Name:               rw.Name,
			Email:              rw.Email,
			Phone:              rw.Phone,
			Dni:                rw.Dni,
			IsMainResident:     rw.IsMainResident,
			IsActive:           rw.IsActive,
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
			ResidentTypeID:   res.ResidentTypeID,
			Name:             res.Name,
			Email:            res.Email,
			Phone:            res.Phone,
			Dni:              res.Dni,
			EmergencyContact: res.EmergencyContact,
			IsActive:         res.IsActive,
			MoveInDate:       res.MoveInDate,
			MoveOutDate:      res.MoveOutDate,
			LeaseStartDate:   res.LeaseStartDate,
			LeaseEndDate:     res.LeaseEndDate,
			MonthlyRent:      res.MonthlyRent,
		}
	}

	// Usar transacción para crear todos o ninguno, incluyendo pivote
	return r.db.Conn(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.CreateInBatches(residentModels, 100).Error; err != nil {
			return fmt.Errorf("error creando residentes en batch: %w", err)
		}

		// Nota: Las relaciones pivote ahora se manejan por separado
		// Este método solo crea los residentes, las relaciones se crean con CreateResidentUnitsInBatch
		return nil
	})
}

// GetResidentIDsByDni retorna un mapa dni -> resident_id para un business determinado
func (r *Repository) GetResidentIDsByDni(ctx context.Context, businessID uint, dnis []string) (map[string]uint, error) {
	result := make(map[string]uint)
	if len(dnis) == 0 {
		return result, nil
	}
	type row struct {
		Dni string
		ID  uint
	}
	var rows []row
	if err := r.db.Conn(ctx).Table("horizontal_property.residents").
		Select("dni, id").
		Where("business_id = ? AND dni IN ?", businessID, dnis).
		Scan(&rows).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo residentes por DNI: %w", err)
	}
	for _, rw := range rows {
		result[rw.Dni] = rw.ID
	}
	return result, nil
}

// CreateResidentUnitsInBatch crea relaciones Resident-Unit en batch
func (r *Repository) CreateResidentUnitsInBatch(ctx context.Context, pivots []domain.ResidentUnit) error {
	if len(pivots) == 0 {
		return nil
	}

	// Convertir domain.ResidentUnit a models.ResidentUnit
	modelPivots := make([]models.ResidentUnit, len(pivots))
	for i, pivot := range pivots {
		modelPivots[i] = models.ResidentUnit{
			BusinessID:     pivot.BusinessID,
			ResidentID:     pivot.ResidentID,
			PropertyUnitID: pivot.PropertyUnitID,
			IsMainResident: pivot.IsMainResident,
			MoveInDate:     pivot.MoveInDate,
			MoveOutDate:    pivot.MoveOutDate,
			LeaseStartDate: pivot.LeaseStartDate,
			LeaseEndDate:   pivot.LeaseEndDate,
			MonthlyRent:    pivot.MonthlyRent,
		}
	}

	return r.db.Conn(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.CreateInBatches(modelPivots, 300).Error; err != nil {
			return fmt.Errorf("error creando relaciones residente-unidad en batch: %w", err)
		}
		return nil
	})
}
