package repository

import (
	"context"
	"fmt"
	"math"
	"strings"
	"time"

	"central_reserve/services/horizontalproperty/resident/internal/domain"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

type ResidentRepository struct {
	db     db.IDatabase
	logger log.ILogger
}

func New(db db.IDatabase, logger log.ILogger) *ResidentRepository {
	return &ResidentRepository{
		db:     db,
		logger: logger,
	}
}

func (r *ResidentRepository) CreateResident(ctx context.Context, resident *domain.Resident) (*domain.Resident, error) {
	// Crear residente base (sin asignación directa a unidad)
	model := &models.Resident{BusinessID: resident.BusinessID,
		ResidentTypeID: resident.ResidentTypeID, Name: resident.Name, Email: resident.Email, Phone: resident.Phone,
		Dni: resident.Dni, EmergencyContact: resident.EmergencyContact, IsActive: resident.IsActive,
		// Campos de compatibilidad (mantener para no romper reportes antiguos)
		MoveInDate: resident.MoveInDate, MoveOutDate: resident.MoveOutDate,
		LeaseStartDate: resident.LeaseStartDate, LeaseEndDate: resident.LeaseEndDate, MonthlyRent: resident.MonthlyRent}

	tx := r.db.Conn(ctx).Begin()
	if err := tx.Create(model).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("error creando residente: %w", err)
	}

	if resident.Dni == "" {
		if err := tx.Model(&models.Resident{}).Where("id = ?", model.ID).Update("dni", gorm.Expr("NULL")).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("error limpiando DNI vacío: %w", err)
		}
		model.Dni = ""
	}

	// Asignar relación con unidad en tabla pivote (unidad principal por defecto si viene en DTO)
	if resident.PropertyUnitID != 0 {
		pivot := &models.ResidentUnit{
			BusinessID:     resident.BusinessID,
			ResidentID:     model.ID,
			PropertyUnitID: resident.PropertyUnitID,
			IsMainResident: resident.IsMainResident,
			MoveInDate:     resident.MoveInDate,
			MoveOutDate:    resident.MoveOutDate,
			LeaseStartDate: resident.LeaseStartDate,
			LeaseEndDate:   resident.LeaseEndDate,
			MonthlyRent:    resident.MonthlyRent,
		}
		if err := tx.Create(pivot).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("error creando relación residente-unidad: %w", err)
		}
	}

	if err := tx.Commit().Error; err != nil {
		return nil, fmt.Errorf("error confirmando creación de residente: %w", err)
	}

	return mapResidentToDomain(model), nil
}

func (r *ResidentRepository) GetResidentByID(ctx context.Context, id uint) (*domain.ResidentDetailDTO, error) {
	var m models.Resident
	if err := r.db.Conn(ctx).Preload("ResidentType").First(&m, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrResidentNotFound
		}
		return nil, fmt.Errorf("error obteniendo residente: %w", err)
	}

	// Obtener unidad principal (o la primera disponible) vía pivote
	type unitRow struct {
		PropertyUnitID     uint
		PropertyUnitNumber string
		IsMainResident     bool
		MoveInDate         *time.Time
		MoveOutDate        *time.Time
		LeaseStartDate     *time.Time
		LeaseEndDate       *time.Time
		MonthlyRent        *float64
	}
	var ur unitRow
	err := r.db.Conn(ctx).Table("horizontal_property.resident_units ru").
		Select("ru.property_unit_id, pu.number as property_unit_number, ru.is_main_resident, ru.move_in_date, ru.move_out_date, ru.lease_start_date, ru.lease_end_date, ru.monthly_rent").
		Joins("JOIN horizontal_property.property_units pu ON pu.id = ru.property_unit_id").
		Where("ru.resident_id = ?", m.ID).
		Order("ru.is_main_resident DESC, ru.id ASC").
		Limit(1).
		Scan(&ur).Error
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, fmt.Errorf("error obteniendo unidad del residente: %w", err)
	}

	return &domain.ResidentDetailDTO{ID: m.ID, BusinessID: m.BusinessID,
		PropertyUnitID: ur.PropertyUnitID, PropertyUnitNumber: ur.PropertyUnitNumber,
		ResidentTypeID: m.ResidentTypeID, ResidentTypeName: m.ResidentType.Name, ResidentTypeCode: m.ResidentType.Code,
		Name: m.Name, Email: m.Email, Phone: m.Phone, Dni: m.Dni,
		EmergencyContact: m.EmergencyContact, IsMainResident: ur.IsMainResident, IsActive: m.IsActive,
		MoveInDate: ur.MoveInDate, MoveOutDate: ur.MoveOutDate, LeaseStartDate: ur.LeaseStartDate,
		LeaseEndDate: ur.LeaseEndDate, MonthlyRent: ur.MonthlyRent, CreatedAt: m.CreatedAt, UpdatedAt: m.UpdatedAt}, nil
}

func (r *ResidentRepository) ListResidents(ctx context.Context, filters domain.ResidentFiltersDTO) (*domain.PaginatedResidentsDTO, error) {
	// Conteo total distinto por residente con joins
	var total int64
	countQuery := r.db.Conn(ctx).Table("horizontal_property.residents r").
		Joins("JOIN horizontal_property.resident_units ru ON ru.resident_id = r.id").
		Joins("JOIN horizontal_property.property_units pu ON pu.id = ru.property_unit_id").
		Where("r.business_id = ?", filters.BusinessID)
	if filters.PropertyUnitNumber != "" {
		countQuery = countQuery.Where("pu.number ILIKE ?", "%"+filters.PropertyUnitNumber+"%")
	}
	if filters.Name != "" {
		countQuery = countQuery.Where("r.name ILIKE ?", "%"+filters.Name+"%")
	}
	if filters.PropertyUnitID != nil {
		countQuery = countQuery.Where("ru.property_unit_id = ?", *filters.PropertyUnitID)
	}
	if filters.ResidentTypeID != nil {
		countQuery = countQuery.Where("r.resident_type_id = ?", *filters.ResidentTypeID)
	}
	if filters.IsActive != nil {
		countQuery = countQuery.Where("r.is_active = ?", *filters.IsActive)
	}
	if filters.IsMainResident != nil {
		countQuery = countQuery.Where("ru.is_main_resident = ?", *filters.IsMainResident)
	}
	if err := countQuery.Distinct("r.id").Count(&total).Error; err != nil {
		return nil, fmt.Errorf("error contando: %w", err)
	}

	// Consulta paginada con selección de unidad principal por residente
	type row struct {
		ID                 uint
		Name               string
		Email              string
		Phone              string
		IsActive           bool
		ResidentTypeName   string
		PropertyUnitNumber string
		IsMainResident     bool
	}
	rows := []row{}
	query := r.db.Conn(ctx).Table("horizontal_property.residents r").
		Select("r.id, r.name, r.email, r.phone, r.is_active, rt.name as resident_type_name, "+
			"COALESCE(MAX(CASE WHEN ru.is_main_resident THEN pu.number END), MIN(pu.number)) as property_unit_number, "+
			"COALESCE(BOOL_OR(ru.is_main_resident), FALSE) as is_main_resident").
		Joins("JOIN horizontal_property.resident_units ru ON ru.resident_id = r.id").
		Joins("JOIN horizontal_property.property_units pu ON pu.id = ru.property_unit_id").
		Joins("JOIN horizontal_property.resident_types rt ON rt.id = r.resident_type_id").
		Where("r.business_id = ?", filters.BusinessID)
	if filters.PropertyUnitNumber != "" {
		query = query.Where("pu.number ILIKE ?", "%"+filters.PropertyUnitNumber+"%")
	}
	if filters.Name != "" {
		query = query.Where("r.name ILIKE ?", "%"+filters.Name+"%")
	}
	if filters.PropertyUnitID != nil {
		query = query.Where("ru.property_unit_id = ?", *filters.PropertyUnitID)
	}
	if filters.ResidentTypeID != nil {
		query = query.Where("r.resident_type_id = ?", *filters.ResidentTypeID)
	}
	if filters.IsActive != nil {
		query = query.Where("r.is_active = ?", *filters.IsActive)
	}
	if filters.IsMainResident != nil {
		query = query.Where("ru.is_main_resident = ?", *filters.IsMainResident)
	}
	offset := (filters.Page - 1) * filters.PageSize
	if err := query.Group("r.id, rt.name").Order("r.name ASC").Limit(filters.PageSize).Offset(offset).Scan(&rows).Error; err != nil {
		return nil, fmt.Errorf("error listando: %w", err)
	}
	residents := make([]domain.ResidentListDTO, len(rows))
	for i, rw := range rows {
		residents[i] = domain.ResidentListDTO{ID: rw.ID, PropertyUnitNumber: rw.PropertyUnitNumber,
			ResidentTypeName: rw.ResidentTypeName, Name: rw.Name, Email: rw.Email, Phone: rw.Phone,
			IsMainResident: rw.IsMainResident, IsActive: rw.IsActive}
	}
	return &domain.PaginatedResidentsDTO{Residents: residents, Total: total, Page: filters.Page,
		PageSize: filters.PageSize, TotalPages: int(math.Ceil(float64(total) / float64(filters.PageSize)))}, nil
}

func (r *ResidentRepository) UpdateResident(ctx context.Context, id uint, resident *domain.Resident) (*domain.Resident, error) {
	updates := map[string]interface{}{
		"resident_type_id":  resident.ResidentTypeID,
		"name":              resident.Name,
		"email":             resident.Email,
		"phone":             resident.Phone,
		"emergency_contact": resident.EmergencyContact,
		"is_active":         resident.IsActive,
	}

	if resident.Dni == "" {
		updates["dni"] = gorm.Expr("NULL")
	} else {
		updates["dni"] = resident.Dni
	}

	if resident.MoveInDate != nil {
		updates["move_in_date"] = resident.MoveInDate
	}
	if resident.MoveOutDate != nil {
		updates["move_out_date"] = resident.MoveOutDate
	}
	if resident.LeaseStartDate != nil {
		updates["lease_start_date"] = resident.LeaseStartDate
	}
	if resident.LeaseEndDate != nil {
		updates["lease_end_date"] = resident.LeaseEndDate
	}
	if resident.MonthlyRent != nil {
		updates["monthly_rent"] = resident.MonthlyRent
	}

	if err := r.db.Conn(ctx).Model(&models.Resident{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		return nil, fmt.Errorf("error actualizando: %w", err)
	}
	var updated models.Resident
	if err := r.db.Conn(ctx).First(&updated, id).Error; err != nil {
		return nil, err
	}
	return mapResidentToDomain(&updated), nil
}

func (r *ResidentRepository) DeleteResident(ctx context.Context, id uint) error {
	// Usar transacción para eliminar votos y luego el residente
	return r.db.Conn(ctx).Transaction(func(tx *gorm.DB) error {
		// 1. Primero eliminar todos los votos del residente
		if err := tx.Where("resident_id = ?", id).Delete(&models.Vote{}).Error; err != nil {
			r.logger.Error().Err(err).Uint("resident_id", id).Msg("Error eliminando votos del residente")
			return fmt.Errorf("error eliminando votos del residente: %w", err)
		}

		// 2. Eliminar de committee_members si existe
		if err := tx.Where("resident_id = ?", id).Delete(&models.CommitteeMember{}).Error; err != nil {
			r.logger.Error().Err(err).Uint("resident_id", id).Msg("Error eliminando membresías de comités")
			return fmt.Errorf("error eliminando membresías de comités: %w", err)
		}

		// 3. Eliminar relaciones en resident_units (tabla intermedia)
		if err := tx.Where("resident_id = ?", id).Delete(&models.ResidentUnit{}).Error; err != nil {
			r.logger.Error().Err(err).Uint("resident_id", id).Msg("Error eliminando relaciones con unidades")
			return fmt.Errorf("error eliminando relaciones con unidades: %w", err)
		}

		// 4. Finalmente eliminar el residente (soft delete)
		if err := tx.Delete(&models.Resident{}, id).Error; err != nil {
			r.logger.Error().Err(err).Uint("resident_id", id).Msg("Error eliminando residente")
			return fmt.Errorf("error eliminando residente: %w", err)
		}

		r.logger.Info().Uint("resident_id", id).Msg("Residente y relaciones eliminadas exitosamente")
		return nil
	})
}

func (r *ResidentRepository) ExistsResidentByEmail(ctx context.Context, businessID uint, email string, excludeID uint) (bool, error) {
	var count int64
	query := r.db.Conn(ctx).Model(&models.Resident{}).Where("business_id = ? AND email = ?", businessID, email)
	if excludeID > 0 {
		query = query.Where("id != ?", excludeID)
	}
	if err := query.Count(&count).Error; err != nil {
		return false, fmt.Errorf("error verificando: %w", err)
	}
	return count > 0, nil
}

func (r *ResidentRepository) ExistsResidentByDni(ctx context.Context, businessID uint, dni string, excludeID uint) (bool, error) {
	var count int64
	query := r.db.Conn(ctx).Model(&models.Resident{}).Where("business_id = ? AND dni = ?", businessID, dni)
	if excludeID > 0 {
		query = query.Where("id != ?", excludeID)
	}
	if err := query.Count(&count).Error; err != nil {
		return false, fmt.Errorf("error verificando: %w", err)
	}
	return count > 0, nil
}

func (r *ResidentRepository) GetResidentByUnitAndDni(ctx context.Context, hpID, propertyUnitID uint, dni string) (*domain.ResidentBasicDTO, error) {
	type row struct {
		ID                 uint
		Name               string
		PropertyUnitID     uint
		PropertyUnitNumber string
	}
	var rw row

	err := r.db.Conn(ctx).
		Table("horizontal_property.residents r").
		Select("r.id, r.name, pu.id as property_unit_id, pu.number as property_unit_number").
		Joins("JOIN horizontal_property.resident_units ru ON ru.resident_id = r.id").
		Joins("JOIN horizontal_property.property_units pu ON pu.id = ru.property_unit_id").
		Where("r.business_id = ? AND ru.property_unit_id = ? AND r.dni = ? AND r.is_active = ?", hpID, propertyUnitID, dni, true).
		Limit(1).Scan(&rw).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("residente no encontrado")
		}
		return nil, fmt.Errorf("error buscando residente: %w", err)
	}

	if rw.ID == 0 {
		return nil, fmt.Errorf("residente no encontrado")
	}

	return &domain.ResidentBasicDTO{ID: rw.ID, Name: rw.Name, PropertyUnitID: rw.PropertyUnitID, PropertyUnitNumber: rw.PropertyUnitNumber}, nil
}

func mapResidentToDomain(m *models.Resident) *domain.Resident {
	// Nota: PropertyUnitID e IsMainResident ahora se gestionan vía pivote; quedan en 0/false a nivel de entidad
	return &domain.Resident{ID: m.ID, BusinessID: m.BusinessID,
		ResidentTypeID: m.ResidentTypeID, Name: m.Name, Email: m.Email, Phone: m.Phone, Dni: m.Dni,
		EmergencyContact: m.EmergencyContact, IsMainResident: false, IsActive: m.IsActive,
		MoveInDate: m.MoveInDate, MoveOutDate: m.MoveOutDate, LeaseStartDate: m.LeaseStartDate,
		LeaseEndDate: m.LeaseEndDate, MonthlyRent: m.MonthlyRent, CreatedAt: m.CreatedAt, UpdatedAt: m.UpdatedAt}
}

// GetPropertyUnitsByNumbers obtiene un mapa de números de unidad a IDs en una sola query
// La búsqueda es insensible a mayúsculas y minúsculas
func (r *ResidentRepository) GetPropertyUnitsByNumbers(ctx context.Context, businessID uint, numbers []string) (map[string]uint, error) {
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
func (r *ResidentRepository) GetMainResidentsByUnitIDs(ctx context.Context, businessID uint, unitIDs []uint) (map[uint]domain.ResidentDetailDTO, error) {
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
func (r *ResidentRepository) UpdateResidentsInBatch(ctx context.Context, pairs []domain.ResidentUpdatePair) error {
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
func (r *ResidentRepository) CreateResidentsInBatch(ctx context.Context, residents []*domain.Resident) error {
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
func (r *ResidentRepository) GetResidentIDsByDni(ctx context.Context, businessID uint, dnis []string) (map[string]uint, error) {
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
func (r *ResidentRepository) CreateResidentUnitsInBatch(ctx context.Context, pivots []domain.ResidentUnit) error {
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
