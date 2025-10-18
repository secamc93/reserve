package repository

import (
	"context"
	"dbpostgres/app/infra/models"
	"fmt"
	"time"

	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/services/horizontalproperty/internal/infra/secondary/repository/mapper"

	"gorm.io/gorm"
)

// ───────────────────────────────────────────
// Attendance Lists
// ───────────────────────────────────────────

func (r *Repository) CreateAttendanceList(ctx context.Context, attendanceList domain.AttendanceList) (*domain.AttendanceList, error) {
	m := &models.AttendanceList{
		VotingGroupID:   attendanceList.VotingGroupID,
		Title:           attendanceList.Title,
		Description:     attendanceList.Description,
		IsActive:        attendanceList.IsActive,
		CreatedByUserID: attendanceList.CreatedByUserID,
		Notes:           attendanceList.Notes,
	}
	if err := r.db.Conn(ctx).Create(m).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error creando lista de asistencia")
		return nil, fmt.Errorf("error creando lista de asistencia: %w", err)
	}
	return mapper.MapAttendanceListToDomain(m), nil
}

func (r *Repository) GetAttendanceListByID(ctx context.Context, id uint) (*domain.AttendanceList, error) {
	var m models.AttendanceList
	if err := r.db.Conn(ctx).First(&m, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("lista de asistencia no encontrada")
		}
		r.logger.Error().Err(err).Uint("id", id).Msg("Error obteniendo lista de asistencia")
		return nil, fmt.Errorf("error obteniendo lista de asistencia: %w", err)
	}
	return mapper.MapAttendanceListToDomain(&m), nil
}

func (r *Repository) GetAttendanceListByVotingGroup(ctx context.Context, votingGroupID uint) (*domain.AttendanceList, error) {
	var m models.AttendanceList
	if err := r.db.Conn(ctx).Where("voting_group_id = ?", votingGroupID).First(&m).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil // No encontrado, no es error
		}
		r.logger.Error().Err(err).Uint("voting_group_id", votingGroupID).Msg("Error obteniendo lista de asistencia por grupo de votación")
		return nil, fmt.Errorf("error obteniendo lista de asistencia: %w", err)
	}
	return mapper.MapAttendanceListToDomain(&m), nil
}

func (r *Repository) ListAttendanceLists(ctx context.Context, businessID uint, filters map[string]interface{}) ([]domain.AttendanceList, error) {
	var m []models.AttendanceList

	query := r.db.Conn(ctx).Joins("JOIN horizontal_property.voting_groups vg ON vg.id = attendance_lists.voting_group_id").
		Where("vg.business_id = ?", businessID)

	// Aplicar filtros
	if title, ok := filters["title"].(string); ok && title != "" {
		query = query.Where("attendance_lists.title ILIKE ?", "%"+title+"%")
	}
	if isActive, ok := filters["is_active"].(bool); ok {
		query = query.Where("attendance_lists.is_active = ?", isActive)
	}

	if err := query.Find(&m).Error; err != nil {
		r.logger.Error().Err(err).Uint("business_id", businessID).Msg("Error listando listas de asistencia")
		return nil, fmt.Errorf("error listando listas de asistencia: %w", err)
	}

	var result []domain.AttendanceList
	for _, item := range m {
		result = append(result, *mapper.MapAttendanceListToDomain(&item))
	}
	return result, nil
}

func (r *Repository) UpdateAttendanceList(ctx context.Context, id uint, attendanceList domain.AttendanceList) (*domain.AttendanceList, error) {
	var m models.AttendanceList
	if err := r.db.Conn(ctx).First(&m, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("lista de asistencia no encontrada")
		}
		r.logger.Error().Err(err).Uint("id", id).Msg("Error obteniendo lista de asistencia para actualizar")
		return nil, fmt.Errorf("error obteniendo lista de asistencia: %w", err)
	}

	// Actualizar campos
	m.Title = attendanceList.Title
	m.Description = attendanceList.Description
	m.IsActive = attendanceList.IsActive
	m.Notes = attendanceList.Notes
	m.UpdatedAt = time.Now()

	if err := r.db.Conn(ctx).Save(&m).Error; err != nil {
		r.logger.Error().Err(err).Uint("id", id).Msg("Error actualizando lista de asistencia")
		return nil, fmt.Errorf("error actualizando lista de asistencia: %w", err)
	}
	return mapper.MapAttendanceListToDomain(&m), nil
}

func (r *Repository) DeleteAttendanceList(ctx context.Context, id uint) error {
	if err := r.db.Conn(ctx).Delete(&models.AttendanceList{}, id).Error; err != nil {
		r.logger.Error().Err(err).Uint("id", id).Msg("Error eliminando lista de asistencia")
		return fmt.Errorf("error eliminando lista de asistencia: %w", err)
	}
	return nil
}

// ───────────────────────────────────────────
// Proxies
// ───────────────────────────────────────────

func (r *Repository) CreateProxy(ctx context.Context, proxy domain.Proxy) (*domain.Proxy, error) {
	m := &models.Proxy{
		BusinessID:      proxy.BusinessID,
		PropertyUnitID:  proxy.PropertyUnitID,
		ProxyName:       proxy.ProxyName,
		ProxyDni:        proxy.ProxyDni,
		ProxyEmail:      proxy.ProxyEmail,
		ProxyPhone:      proxy.ProxyPhone,
		ProxyAddress:    proxy.ProxyAddress,
		ProxyType:       proxy.ProxyType,
		IsActive:        proxy.IsActive,
		StartDate:       proxy.StartDate,
		EndDate:         proxy.EndDate,
		PowerOfAttorney: proxy.PowerOfAttorney,
		Notes:           proxy.Notes,
	}
	if err := r.db.Conn(ctx).Create(m).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error creando apoderado")
		return nil, fmt.Errorf("error creando apoderado: %w", err)
	}
	return mapper.MapProxyToDomain(m), nil
}

func (r *Repository) GetProxyByID(ctx context.Context, id uint) (*domain.Proxy, error) {
	var m models.Proxy
	if err := r.db.Conn(ctx).First(&m, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("apoderado no encontrado")
		}
		r.logger.Error().Err(err).Uint("id", id).Msg("Error obteniendo apoderado")
		return nil, fmt.Errorf("error obteniendo apoderado: %w", err)
	}
	return mapper.MapProxyToDomain(&m), nil
}

func (r *Repository) GetProxiesByPropertyUnit(ctx context.Context, propertyUnitID uint) ([]domain.Proxy, error) {
	var m []models.Proxy
	if err := r.db.Conn(ctx).Where("property_unit_id = ?", propertyUnitID).Find(&m).Error; err != nil {
		r.logger.Error().Err(err).Uint("property_unit_id", propertyUnitID).Msg("Error obteniendo apoderados por unidad")
		return nil, fmt.Errorf("error obteniendo apoderados: %w", err)
	}

	var result []domain.Proxy
	for _, item := range m {
		result = append(result, *mapper.MapProxyToDomain(&item))
	}
	return result, nil
}

func (r *Repository) GetActiveProxiesByPropertyUnit(ctx context.Context, propertyUnitID uint) ([]domain.Proxy, error) {
	var m []models.Proxy
	now := time.Now()
	if err := r.db.Conn(ctx).Where("property_unit_id = ? AND is_active = ? AND (end_date IS NULL OR end_date > ?)",
		propertyUnitID, true, now).Find(&m).Error; err != nil {
		r.logger.Error().Err(err).Uint("property_unit_id", propertyUnitID).Msg("Error obteniendo apoderados activos por unidad")
		return nil, fmt.Errorf("error obteniendo apoderados activos: %w", err)
	}

	var result []domain.Proxy
	for _, item := range m {
		result = append(result, *mapper.MapProxyToDomain(&item))
	}
	return result, nil
}

func (r *Repository) ListProxies(ctx context.Context, businessID uint, filters map[string]interface{}) ([]domain.Proxy, error) {
	var m []models.Proxy

	query := r.db.Conn(ctx).Where("business_id = ?", businessID)

	// Aplicar filtros
	if propertyUnitID, ok := filters["property_unit_id"].(uint); ok {
		query = query.Where("property_unit_id = ?", propertyUnitID)
	}
	if proxyType, ok := filters["proxy_type"].(string); ok && proxyType != "" {
		query = query.Where("proxy_type = ?", proxyType)
	}
	if isActive, ok := filters["is_active"].(bool); ok {
		query = query.Where("is_active = ?", isActive)
	}

	if err := query.Find(&m).Error; err != nil {
		r.logger.Error().Err(err).Uint("business_id", businessID).Msg("Error listando apoderados")
		return nil, fmt.Errorf("error listando apoderados: %w", err)
	}

	var result []domain.Proxy
	for _, item := range m {
		result = append(result, *mapper.MapProxyToDomain(&item))
	}
	return result, nil
}

func (r *Repository) UpdateProxy(ctx context.Context, id uint, proxy domain.Proxy) (*domain.Proxy, error) {
	var m models.Proxy
	if err := r.db.Conn(ctx).First(&m, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("apoderado no encontrado")
		}
		r.logger.Error().Err(err).Uint("id", id).Msg("Error obteniendo apoderado para actualizar")
		return nil, fmt.Errorf("error obteniendo apoderado: %w", err)
	}

	// Actualizar campos
	m.ProxyName = proxy.ProxyName
	m.ProxyDni = proxy.ProxyDni
	m.ProxyEmail = proxy.ProxyEmail
	m.ProxyPhone = proxy.ProxyPhone
	m.ProxyAddress = proxy.ProxyAddress
	m.ProxyType = proxy.ProxyType
	m.IsActive = proxy.IsActive
	m.StartDate = proxy.StartDate
	m.EndDate = proxy.EndDate
	m.PowerOfAttorney = proxy.PowerOfAttorney
	m.Notes = proxy.Notes
	m.UpdatedAt = time.Now()

	if err := r.db.Conn(ctx).Save(&m).Error; err != nil {
		r.logger.Error().Err(err).Uint("id", id).Msg("Error actualizando apoderado")
		return nil, fmt.Errorf("error actualizando apoderado: %w", err)
	}
	return mapper.MapProxyToDomain(&m), nil
}

func (r *Repository) DeleteProxy(ctx context.Context, id uint) error {
	if err := r.db.Conn(ctx).Delete(&models.Proxy{}, id).Error; err != nil {
		r.logger.Error().Err(err).Uint("id", id).Msg("Error eliminando apoderado")
		return fmt.Errorf("error eliminando apoderado: %w", err)
	}
	return nil
}

// ───────────────────────────────────────────
// Attendance Records
// ───────────────────────────────────────────

func (r *Repository) CreateAttendanceRecord(ctx context.Context, record domain.AttendanceRecord) (*domain.AttendanceRecord, error) {
	m := &models.AttendanceRecord{
		AttendanceListID:  record.AttendanceListID,
		PropertyUnitID:    record.PropertyUnitID,
		ResidentID:        record.ResidentID,
		ProxyID:           record.ProxyID,
		AttendedAsOwner:   record.AttendedAsOwner,
		AttendedAsProxy:   record.AttendedAsProxy,
		Signature:         record.Signature,
		SignatureDate:     record.SignatureDate,
		SignatureMethod:   record.SignatureMethod,
		VerifiedBy:        record.VerifiedBy,
		VerificationDate:  record.VerificationDate,
		VerificationNotes: record.VerificationNotes,
		Notes:             record.Notes,
		IsValid:           record.IsValid,
	}
	if err := r.db.Conn(ctx).Create(m).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error creando registro de asistencia")
		return nil, fmt.Errorf("error creando registro de asistencia: %w", err)
	}
	return mapper.MapAttendanceRecordToDomain(m), nil
}

func (r *Repository) GetAttendanceRecordByID(ctx context.Context, id uint) (*domain.AttendanceRecord, error) {
	var m models.AttendanceRecord
	if err := r.db.Conn(ctx).First(&m, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("registro de asistencia no encontrado")
		}
		r.logger.Error().Err(err).Uint("id", id).Msg("Error obteniendo registro de asistencia")
		return nil, fmt.Errorf("error obteniendo registro de asistencia: %w", err)
	}
	return mapper.MapAttendanceRecordToDomain(&m), nil
}

func (r *Repository) GetAttendanceRecordsByList(ctx context.Context, attendanceListID uint) ([]domain.AttendanceRecord, error) {
	type row struct {
		models.AttendanceRecord
		ResidentName             string
		ProxyName                string
		UnitNumber               string
		ParticipationCoefficient string
	}
	var rows []row
	if err := r.db.Conn(ctx).
		Table("horizontal_property.attendance_records ar").
		Select(`ar.id, ar.created_at, ar.updated_at, ar.deleted_at, 
			ar.attendance_list_id, ar.property_unit_id, ar.resident_id, ar.proxy_id,
			ar.attended_as_owner, ar.attended_as_proxy, ar.signature, ar.signature_date, 
			ar.signature_method, ar.verified_by, ar.verification_date, ar.verification_notes, 
			ar.notes, ar.is_valid,
			COALESCE(r.name, r2.name, '') as resident_name, 
			COALESCE(p.proxy_name,'') as proxy_name, 
			pu.number as unit_number,
			COALESCE(CAST(pu.participation_coefficient AS TEXT), '0.000000') as participation_coefficient`).
		Joins("LEFT JOIN horizontal_property.residents r ON r.id = ar.resident_id").
		Joins("LEFT JOIN horizontal_property.resident_units ru ON ru.property_unit_id = ar.property_unit_id AND ru.is_main_resident = TRUE").
		Joins("LEFT JOIN horizontal_property.residents r2 ON r2.id = ru.resident_id").
		Joins("JOIN horizontal_property.property_units pu ON pu.id = ar.property_unit_id").
		Joins("LEFT JOIN horizontal_property.proxies p ON p.id = ar.proxy_id").
		Where("ar.attendance_list_id = ?", attendanceListID).
		Order("ar.id ASC").
		Scan(&rows).Error; err != nil {
		r.logger.Error().Err(err).Uint("attendance_list_id", attendanceListID).Msg("Error obteniendo registros de asistencia por lista")
		return nil, fmt.Errorf("error obteniendo registros de asistencia: %w", err)
	}

	var result []domain.AttendanceRecord
	for _, item := range rows {
		// Log simple para debug
		fmt.Printf("DEBUG REPO: Unidad %s, Coeficiente: %s\n", item.UnitNumber, item.ParticipationCoefficient)

		rec := mapper.MapAttendanceRecordToDomain(&item.AttendanceRecord)
		rec.ResidentName = item.ResidentName
		rec.ProxyName = item.ProxyName
		rec.UnitNumber = item.UnitNumber

		// Asignar coeficiente como string
		rec.ParticipationCoefficient = item.ParticipationCoefficient

		// Log para verificar que se asignó correctamente
		fmt.Printf("DEBUG REPO FINAL: Unidad %s, Coeficiente asignado: %s\n", rec.UnitNumber, rec.ParticipationCoefficient)

		result = append(result, *rec)
	}
	return result, nil
}

// GetAttendanceRecordsByListPaged - lista registros con filtros y paginación
func (r *Repository) GetAttendanceRecordsByListPaged(ctx context.Context, attendanceListID uint, unitNumber string, attended *bool, page int, pageSize int) ([]domain.AttendanceRecord, int64, error) {
	type row struct {
		models.AttendanceRecord
		ResidentName             string
		ProxyName                string
		UnitNumber               string
		ParticipationCoefficient string
	}

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 200 {
		pageSize = 50
	}
	offset := (page - 1) * pageSize

	base := r.db.Conn(ctx).
		Table("horizontal_property.attendance_records ar").
		Joins("LEFT JOIN horizontal_property.residents r ON r.id = ar.resident_id").
		Joins("LEFT JOIN horizontal_property.resident_units ru ON ru.property_unit_id = ar.property_unit_id AND ru.is_main_resident = TRUE").
		Joins("LEFT JOIN horizontal_property.residents r2 ON r2.id = ru.resident_id").
		Joins("JOIN horizontal_property.property_units pu ON pu.id = ar.property_unit_id").
		Joins("LEFT JOIN horizontal_property.proxies p ON p.id = ar.proxy_id").
		Where("ar.attendance_list_id = ?", attendanceListID)

	if unitNumber != "" {
		base = base.Where("pu.number ILIKE ?", "%"+unitNumber+"%")
	}
	if attended != nil {
		if *attended {
			base = base.Where("(ar.attended_as_owner = TRUE OR ar.attended_as_proxy = TRUE)")
		} else {
			base = base.Where("(ar.attended_as_owner = FALSE AND ar.attended_as_proxy = FALSE)")
		}
	}

	// Conteo total
	var total int64
	if err := base.Session(&gorm.Session{}).Count(&total).Error; err != nil {
		r.logger.Error().Err(err).Uint("attendance_list_id", attendanceListID).Msg("Error contando registros paginados")
		return nil, 0, fmt.Errorf("error contando registros: %w", err)
	}

	// Selección paginada - especificar campos explícitamente para evitar problemas de mapeo
	var rows []row
	if err := base.
		Select(`ar.id, ar.created_at, ar.updated_at, ar.deleted_at, 
			ar.attendance_list_id, ar.property_unit_id, ar.resident_id, ar.proxy_id,
			ar.attended_as_owner, ar.attended_as_proxy, ar.signature, ar.signature_date, 
			ar.signature_method, ar.verified_by, ar.verification_date, ar.verification_notes, 
			ar.notes, ar.is_valid,
			COALESCE(r.name, r2.name, '') as resident_name, 
			COALESCE(p.proxy_name,'') as proxy_name, 
			pu.number as unit_number,
			COALESCE(CAST(pu.participation_coefficient AS TEXT), '0.000000') as participation_coefficient`).
		Order("pu.number ASC, ar.id ASC").
		Offset(offset).Limit(pageSize).
		Scan(&rows).Error; err != nil {
		r.logger.Error().Err(err).Uint("attendance_list_id", attendanceListID).Msg("Error listando registros paginados")
		return nil, 0, fmt.Errorf("error obteniendo registros de asistencia: %w", err)
	}

	var result []domain.AttendanceRecord
	for _, item := range rows {
		// Log para debug del mapeo
		r.logger.Debug().
			Uint("id", item.AttendanceRecord.ID).
			Bool("attended_as_owner", item.AttendanceRecord.AttendedAsOwner).
			Bool("attended_as_proxy", item.AttendanceRecord.AttendedAsProxy).
			Bool("is_valid", item.AttendanceRecord.IsValid).
			Str("resident_name", item.ResidentName).
			Str("unit_number", item.UnitNumber).
			Msg("Mapeando registro de asistencia")

		rec := mapper.MapAttendanceRecordToDomain(&item.AttendanceRecord)
		rec.ResidentName = item.ResidentName
		rec.ProxyName = item.ProxyName
		rec.UnitNumber = item.UnitNumber

		// Asignar coeficiente como string
		rec.ParticipationCoefficient = item.ParticipationCoefficient

		result = append(result, *rec)
	}
	return result, total, nil
}

func (r *Repository) GetAttendanceRecordByListAndUnit(ctx context.Context, attendanceListID, propertyUnitID uint) (*domain.AttendanceRecord, error) {
	var m models.AttendanceRecord
	if err := r.db.Conn(ctx).Where("attendance_list_id = ? AND property_unit_id = ?",
		attendanceListID, propertyUnitID).First(&m).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil // No encontrado, no es error
		}
		r.logger.Error().Err(err).
			Uint("attendance_list_id", attendanceListID).
			Uint("property_unit_id", propertyUnitID).
			Msg("Error obteniendo registro de asistencia por lista y unidad")
		return nil, fmt.Errorf("error obteniendo registro de asistencia: %w", err)
	}
	return mapper.MapAttendanceRecordToDomain(&m), nil
}

func (r *Repository) UpdateAttendanceRecord(ctx context.Context, id uint, record domain.AttendanceRecord) (*domain.AttendanceRecord, error) {
	var m models.AttendanceRecord
	if err := r.db.Conn(ctx).First(&m, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("registro de asistencia no encontrado")
		}
		r.logger.Error().Err(err).Uint("id", id).Msg("Error obteniendo registro de asistencia para actualizar")
		return nil, fmt.Errorf("error obteniendo registro de asistencia: %w", err)
	}

	// Actualizar campos
	m.ResidentID = record.ResidentID
	m.ProxyID = record.ProxyID
	m.AttendedAsOwner = record.AttendedAsOwner
	m.AttendedAsProxy = record.AttendedAsProxy
	m.Signature = record.Signature
	m.SignatureDate = record.SignatureDate
	m.SignatureMethod = record.SignatureMethod
	m.VerifiedBy = record.VerifiedBy
	m.VerificationDate = record.VerificationDate
	m.VerificationNotes = record.VerificationNotes
	m.Notes = record.Notes
	m.IsValid = record.IsValid
	m.UpdatedAt = time.Now()

	if err := r.db.Conn(ctx).Save(&m).Error; err != nil {
		r.logger.Error().Err(err).Uint("id", id).Msg("Error actualizando registro de asistencia")
		return nil, fmt.Errorf("error actualizando registro de asistencia: %w", err)
	}
	return mapper.MapAttendanceRecordToDomain(&m), nil
}

// UpdateAttendanceRecordSimple - actualiza solo los campos de asistencia de forma simple
func (r *Repository) UpdateAttendanceRecordSimple(ctx context.Context, id uint, attendedAsOwner, attendedAsProxy bool) (*domain.AttendanceRecord, error) {
	r.logger.Info().
		Uint("id", id).
		Bool("attended_as_owner", attendedAsOwner).
		Bool("attended_as_proxy", attendedAsProxy).
		Msg("Iniciando UpdateAttendanceRecordSimple")

	// Verificar primero si el registro existe en la tabla correcta
	var existingRecord models.AttendanceRecord
	if err := r.db.Conn(ctx).Table("horizontal_property.attendance_records").First(&existingRecord, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			r.logger.Error().
				Uint("id", id).
				Msg("Registro no encontrado en horizontal_property.attendance_records")
			return nil, fmt.Errorf("registro de asistencia no encontrado")
		}
		r.logger.Error().Err(err).Uint("id", id).Msg("Error verificando existencia del registro")
		return nil, fmt.Errorf("error verificando registro: %w", err)
	}

	r.logger.Info().
		Uint("id", id).
		Uint("attendance_list_id", existingRecord.AttendanceListID).
		Uint("property_unit_id", existingRecord.PropertyUnitID).
		Msg("Registro encontrado, procediendo a actualizar")

	// Actualizar directamente en la tabla correcta
	result := r.db.Conn(ctx).Table("horizontal_property.attendance_records").
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"attended_as_owner": attendedAsOwner,
			"attended_as_proxy": attendedAsProxy,
			"updated_at":        time.Now(),
		})

	if result.Error != nil {
		r.logger.Error().Err(result.Error).Uint("id", id).Msg("Error ejecutando UPDATE en base de datos")
		return nil, fmt.Errorf("error actualizando registro de asistencia: %w", result.Error)
	}

	r.logger.Info().
		Uint("id", id).
		Int64("rows_affected", result.RowsAffected).
		Msg("UPDATE ejecutado en base de datos")

	if result.RowsAffected == 0 {
		r.logger.Error().
			Uint("id", id).
			Msg("UPDATE no afectó ninguna fila - registro no encontrado")
		return nil, fmt.Errorf("registro de asistencia no encontrado")
	}

	// Obtener el registro actualizado para devolverlo
	var m models.AttendanceRecord
	if err := r.db.Conn(ctx).Table("horizontal_property.attendance_records").First(&m, id).Error; err != nil {
		r.logger.Error().Err(err).Uint("id", id).Msg("Error obteniendo registro actualizado después del UPDATE")
		return nil, fmt.Errorf("error obteniendo registro actualizado: %w", err)
	}

	r.logger.Info().
		Uint("id", m.ID).
		Bool("attended_as_owner", m.AttendedAsOwner).
		Bool("attended_as_proxy", m.AttendedAsProxy).
		Msg("Registro actualizado exitosamente")

	return mapper.MapAttendanceRecordToDomain(&m), nil
}

func (r *Repository) DeleteAttendanceRecord(ctx context.Context, id uint) error {
	if err := r.db.Conn(ctx).Delete(&models.AttendanceRecord{}, id).Error; err != nil {
		r.logger.Error().Err(err).Uint("id", id).Msg("Error eliminando registro de asistencia")
		return fmt.Errorf("error eliminando registro de asistencia: %w", err)
	}
	return nil
}

// ───────────────────────────────────────────
// Bulk Operations
// ───────────────────────────────────────────

func (r *Repository) CreateAttendanceRecordsInBatch(ctx context.Context, records []domain.AttendanceRecord) error {
	if len(records) == 0 {
		return nil
	}

	var modelRecords []models.AttendanceRecord
	for _, record := range records {
		modelRecords = append(modelRecords, models.AttendanceRecord{
			AttendanceListID:  record.AttendanceListID,
			PropertyUnitID:    record.PropertyUnitID,
			ResidentID:        record.ResidentID,
			ProxyID:           record.ProxyID,
			AttendedAsOwner:   record.AttendedAsOwner,
			AttendedAsProxy:   record.AttendedAsProxy,
			Signature:         record.Signature,
			SignatureDate:     record.SignatureDate,
			SignatureMethod:   record.SignatureMethod,
			VerifiedBy:        record.VerifiedBy,
			VerificationDate:  record.VerificationDate,
			VerificationNotes: record.VerificationNotes,
			Notes:             record.Notes,
			IsValid:           record.IsValid,
		})
	}

	if err := r.db.Conn(ctx).CreateInBatches(modelRecords, 100).Error; err != nil {
		r.logger.Error().Err(err).Int("count", len(records)).Msg("Error creando registros de asistencia en batch")
		return fmt.Errorf("error creando registros de asistencia en batch: %w", err)
	}
	return nil
}

// DeleteAttendanceRecordsByList - elimina todos los registros de una lista
func (r *Repository) DeleteAttendanceRecordsByList(ctx context.Context, attendanceListID uint) error {
	if err := r.db.Conn(ctx).Where("attendance_list_id = ?", attendanceListID).Delete(&models.AttendanceRecord{}).Error; err != nil {
		r.logger.Error().Err(err).Uint("attendance_list_id", attendanceListID).Msg("Error eliminando registros de asistencia de la lista")
		return fmt.Errorf("error eliminando registros de asistencia: %w", err)
	}
	return nil
}

func (r *Repository) GenerateAttendanceListForVotingGroup(ctx context.Context, votingGroupID uint) ([]domain.AttendanceRecord, error) {
	// Obtener todas las unidades de la propiedad horizontal asociada al grupo de votación
	var units []models.PropertyUnit
	if err := r.db.Conn(ctx).
		Joins("JOIN horizontal_property.voting_groups vg ON vg.business_id = property_units.business_id").
		Where("vg.id = ?", votingGroupID).
		Find(&units).Error; err != nil {
		r.logger.Error().Err(err).Uint("voting_group_id", votingGroupID).Msg("Error obteniendo unidades para lista de asistencia")
		return nil, fmt.Errorf("error obteniendo unidades: %w", err)
	}

	// Obtener la lista de asistencia
	var attendanceList models.AttendanceList
	if err := r.db.Conn(ctx).Where("voting_group_id = ?", votingGroupID).First(&attendanceList).Error; err != nil {
		r.logger.Error().Err(err).Uint("voting_group_id", votingGroupID).Msg("Error obteniendo lista de asistencia")
		return nil, fmt.Errorf("error obteniendo lista de asistencia: %w", err)
	}

	// Crear registros de asistencia para cada unidad
	var records []domain.AttendanceRecord
	for _, unit := range units {
		records = append(records, domain.AttendanceRecord{
			AttendanceListID: attendanceList.ID,
			PropertyUnitID:   unit.ID,
			AttendedAsOwner:  false,
			AttendedAsProxy:  false,
			IsValid:          false, // La asistencia no está confirmada aún
		})
	}

	return records, nil
}

func (r *Repository) GetAttendanceSummary(ctx context.Context, attendanceListID uint) (*domain.AttendanceSummaryDTO, error) {
	var result struct {
		TotalUnits      int64 `json:"total_units"`
		AttendedUnits   int64 `json:"attended_units"`
		AttendedAsOwner int64 `json:"attended_as_owner"`
		AttendedAsProxy int64 `json:"attended_as_proxy"`
	}

	// Contar total de unidades
	if err := r.db.Conn(ctx).Model(&models.AttendanceRecord{}).
		Where("attendance_list_id = ?", attendanceListID).
		Count(&result.TotalUnits).Error; err != nil {
		r.logger.Error().Err(err).Uint("attendance_list_id", attendanceListID).Msg("Error contando total de unidades")
		return nil, fmt.Errorf("error obteniendo resumen de asistencia: %w", err)
	}

	// Contar unidades que asistieron
	if err := r.db.Conn(ctx).Model(&models.AttendanceRecord{}).
		Where("attendance_list_id = ? AND (attended_as_owner = ? OR attended_as_proxy = ?)",
			attendanceListID, true, true).
		Count(&result.AttendedUnits).Error; err != nil {
		r.logger.Error().Err(err).Uint("attendance_list_id", attendanceListID).Msg("Error contando unidades que asistieron")
		return nil, fmt.Errorf("error obteniendo resumen de asistencia: %w", err)
	}

	// Contar asistencias como propietario (proxy_id IS NULL)
	if err := r.db.Conn(ctx).Model(&models.AttendanceRecord{}).
		Where("attendance_list_id = ? AND (attended_as_owner = ? OR attended_as_proxy = ?) AND proxy_id IS NULL",
			attendanceListID, true, true).
		Count(&result.AttendedAsOwner).Error; err != nil {
		r.logger.Error().Err(err).Uint("attendance_list_id", attendanceListID).Msg("Error contando asistencias como propietario")
		return nil, fmt.Errorf("error obteniendo resumen de asistencia: %w", err)
	}

	// Contar asistencias como apoderado (proxy_id IS NOT NULL)
	if err := r.db.Conn(ctx).Model(&models.AttendanceRecord{}).
		Where("attendance_list_id = ? AND (attended_as_owner = ? OR attended_as_proxy = ?) AND proxy_id IS NOT NULL",
			attendanceListID, true, true).
		Count(&result.AttendedAsProxy).Error; err != nil {
		r.logger.Error().Err(err).Uint("attendance_list_id", attendanceListID).Msg("Error contando asistencias como apoderado")
		return nil, fmt.Errorf("error obteniendo resumen de asistencia: %w", err)
	}

	// Calcular porcentajes por cantidad de casas
	var attendanceRate, absenceRate float64
	if result.TotalUnits > 0 {
		attendanceRate = float64(result.AttendedUnits) / float64(result.TotalUnits) * 100
		absenceRate = float64(result.TotalUnits-result.AttendedUnits) / float64(result.TotalUnits) * 100
	}

	// Calcular porcentajes por coeficiente de participación
	var totalCoefficient, attendedCoefficient float64

	// Obtener coeficiente total de todas las unidades
	if err := r.db.Conn(ctx).Model(&models.AttendanceRecord{}).
		Joins("JOIN horizontal_property.property_units pu ON pu.id = attendance_records.property_unit_id").
		Where("attendance_records.attendance_list_id = ? AND pu.participation_coefficient IS NOT NULL", attendanceListID).
		Select("COALESCE(SUM(pu.participation_coefficient), 0)").
		Scan(&totalCoefficient).Error; err != nil {
		r.logger.Error().Err(err).Uint("attendance_list_id", attendanceListID).Msg("Error calculando coeficiente total")
		return nil, fmt.Errorf("error calculando coeficiente total: %w", err)
	}

	// Obtener coeficiente de unidades que asistieron
	if err := r.db.Conn(ctx).Model(&models.AttendanceRecord{}).
		Joins("JOIN horizontal_property.property_units pu ON pu.id = attendance_records.property_unit_id").
		Where("attendance_records.attendance_list_id = ? AND (attendance_records.attended_as_owner = ? OR attendance_records.attended_as_proxy = ?) AND pu.participation_coefficient IS NOT NULL",
			attendanceListID, true, true).
		Select("COALESCE(SUM(pu.participation_coefficient), 0)").
		Scan(&attendedCoefficient).Error; err != nil {
		r.logger.Error().Err(err).Uint("attendance_list_id", attendanceListID).Msg("Error calculando coeficiente de asistencia")
		return nil, fmt.Errorf("error calculando coeficiente de asistencia: %w", err)
	}

	// Calcular porcentajes por coeficiente
	var attendanceRateByCoef, absenceRateByCoef float64
	if totalCoefficient > 0 {
		attendanceRateByCoef = (attendedCoefficient / totalCoefficient) * 100
		absenceRateByCoef = ((totalCoefficient - attendedCoefficient) / totalCoefficient) * 100
	}

	return &domain.AttendanceSummaryDTO{
		TotalUnits:           int(result.TotalUnits),
		AttendedUnits:        int(result.AttendedUnits),
		AbsentUnits:          int(result.TotalUnits - result.AttendedUnits),
		AttendedAsOwner:      int(result.AttendedAsOwner),
		AttendedAsProxy:      int(result.AttendedAsProxy),
		AttendanceRate:       attendanceRate,
		AbsenceRate:          absenceRate,
		AttendanceRateByCoef: attendanceRateByCoef,
		AbsenceRateByCoef:    absenceRateByCoef,
	}, nil
}

// GetVotingGroupTitleByListID - obtiene el título del grupo de votación para la lista
func (r *Repository) GetVotingGroupTitleByListID(ctx context.Context, attendanceListID uint) (string, error) {
	var title string
	err := r.db.Conn(ctx).
		Table("horizontal_property.attendance_lists al").
		Select("vg.name").
		Joins("JOIN horizontal_property.voting_groups vg ON vg.id = al.voting_group_id").
		Where("al.id = ?", attendanceListID).
		Scan(&title).Error
	if err != nil {
		return "", fmt.Errorf("error obteniendo título del grupo: %w", err)
	}
	return title, nil
}

// UpdateAttendanceRecordsByPropertyUnit - actualiza registros de asistencia para una unidad de propiedad específica
func (r *Repository) UpdateAttendanceRecordsByPropertyUnit(ctx context.Context, propertyUnitID uint, proxyID *uint) error {
	r.logger.Info().
		Uint("property_unit_id", propertyUnitID).
		Interface("proxy_id", proxyID).
		Msg("Actualizando registros de asistencia por unidad de propiedad")

	// Actualizar todos los registros de asistencia para esta unidad
	result := r.db.Conn(ctx).Model(&models.AttendanceRecord{}).
		Where("property_unit_id = ?", propertyUnitID).
		Update("proxy_id", proxyID)

	if result.Error != nil {
		r.logger.Error().Err(result.Error).
			Uint("property_unit_id", propertyUnitID).
			Interface("proxy_id", proxyID).
			Msg("Error actualizando registros de asistencia por unidad")
		return fmt.Errorf("error actualizando registros de asistencia: %w", result.Error)
	}

	r.logger.Info().
		Uint("property_unit_id", propertyUnitID).
		Interface("proxy_id", proxyID).
		Int64("rows_affected", result.RowsAffected).
		Msg("Registros de asistencia actualizados exitosamente")

	return nil
}
