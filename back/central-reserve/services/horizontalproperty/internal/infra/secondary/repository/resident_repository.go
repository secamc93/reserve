package repository

import (
	"central_reserve/services/horizontalproperty/internal/domain"
	"context"
	"dbpostgres/app/infra/models"
	"fmt"
	"math"
	"time"

	"gorm.io/gorm"
)

func (r *Repository) CreateResident(ctx context.Context, resident *domain.Resident) (*domain.Resident, error) {
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

func (r *Repository) GetResidentByID(ctx context.Context, id uint) (*domain.ResidentDetailDTO, error) {
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

func (r *Repository) ListResidents(ctx context.Context, filters domain.ResidentFiltersDTO) (*domain.PaginatedResidentsDTO, error) {
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

func (r *Repository) UpdateResident(ctx context.Context, id uint, resident *domain.Resident) (*domain.Resident, error) {
	// Actualiza datos del residente (campos propios)
	model := &models.Resident{ResidentTypeID: resident.ResidentTypeID,
		Name: resident.Name, Email: resident.Email, Phone: resident.Phone, Dni: resident.Dni,
		EmergencyContact: resident.EmergencyContact, IsActive: resident.IsActive}
	if err := r.db.Conn(ctx).Model(&models.Resident{}).Where("id = ?", id).Updates(model).Error; err != nil {
		return nil, fmt.Errorf("error actualizando: %w", err)
	}
	var updated models.Resident
	if err := r.db.Conn(ctx).First(&updated, id).Error; err != nil {
		return nil, err
	}
	return mapResidentToDomain(&updated), nil
}

func (r *Repository) DeleteResident(ctx context.Context, id uint) error {
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

func (r *Repository) ExistsResidentByEmail(ctx context.Context, businessID uint, email string, excludeID uint) (bool, error) {
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

func (r *Repository) ExistsResidentByDni(ctx context.Context, businessID uint, dni string, excludeID uint) (bool, error) {
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

func (r *Repository) GetResidentByUnitAndDni(ctx context.Context, hpID, propertyUnitID uint, dni string) (*domain.ResidentBasicDTO, error) {
	type row struct {
		ID                 uint
		Name               string
		PropertyUnitID     uint
		PropertyUnitNumber string
	}
	var rw row

	fmt.Printf("🔍 [REPOSITORY] GetResidentByUnitAndDni - Buscando residente\n")
	fmt.Printf("   HP ID: %d\n", hpID)
	fmt.Printf("   Property Unit ID: %d\n", propertyUnitID)
	fmt.Printf("   DNI: '%s'\n", dni)

	err := r.db.Conn(ctx).
		Table("horizontal_property.residents r").
		Select("r.id, r.name, pu.id as property_unit_id, pu.number as property_unit_number").
		Joins("JOIN horizontal_property.resident_units ru ON ru.resident_id = r.id").
		Joins("JOIN horizontal_property.property_units pu ON pu.id = ru.property_unit_id").
		Where("r.business_id = ? AND ru.property_unit_id = ? AND r.dni = ? AND r.is_active = ?", hpID, propertyUnitID, dni, true).
		Limit(1).Scan(&rw).Error

	fmt.Printf("🔍 [REPOSITORY] GetResidentByUnitAndDni - Resultado de consulta\n")
	fmt.Printf("   Error: %v\n", err)
	fmt.Printf("   Row ID: %d\n", rw.ID)
	fmt.Printf("   Row Name: '%s'\n", rw.Name)
	fmt.Printf("   Row PropertyUnitID: %d\n", rw.PropertyUnitID)
	fmt.Printf("   Row PropertyUnitNumber: '%s'\n", rw.PropertyUnitNumber)

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			fmt.Printf("❌ [REPOSITORY] GetResidentByUnitAndDni - Residente no encontrado\n")
			return nil, fmt.Errorf("residente no encontrado")
		}
		fmt.Printf("❌ [REPOSITORY] GetResidentByUnitAndDni - Error en consulta: %v\n", err)
		return nil, fmt.Errorf("error buscando residente: %w", err)
	}

	// Verificar si el resultado tiene ID 0 (puede pasar con Scan)
	if rw.ID == 0 {
		fmt.Printf("❌ [REPOSITORY] GetResidentByUnitAndDni - Residente encontrado pero con ID 0\n")
		return nil, fmt.Errorf("residente no encontrado")
	}

	fmt.Printf("✅ [REPOSITORY] GetResidentByUnitAndDni - Residente encontrado\n")
	fmt.Printf("   ID: %d\n", rw.ID)
	fmt.Printf("   Name: '%s'\n", rw.Name)
	fmt.Printf("   PropertyUnitID: %d\n", rw.PropertyUnitID)
	fmt.Printf("   PropertyUnitNumber: '%s'\n", rw.PropertyUnitNumber)

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
