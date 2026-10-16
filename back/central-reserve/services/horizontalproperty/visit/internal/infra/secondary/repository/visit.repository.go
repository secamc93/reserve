package repository

import (
	"context"
	"fmt"
	"math"
	"strings"
	"time"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/services/horizontalproperty/visit/internal/infra/secondary/repository/mappers"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

type VisitRepository struct {
	db     db.IDatabase
	logger log.ILogger
}

func NewVisitRepository(db db.IDatabase, logger log.ILogger) domain.VisitRepository {
	return &VisitRepository{
		db:     db,
		logger: logger,
	}
}

// CreateVisit crea una nueva visita
func (r *VisitRepository) CreateVisit(ctx context.Context, visit *domain.Visit) (*domain.Visit, error) {
	model := &models.Visit{
		BusinessID:             visit.BusinessID,
		VisitorID:              visit.VisitorID,
		PropertyUnitID:         visit.PropertyUnitID,
		ResidentID:             visit.ResidentID,
		VisitTypeID:            visit.VisitTypeID,
		VisitStatusID:          visit.VisitStatusID,
		VisitorVehicleID:       visit.VisitorVehicleID,
		ScheduledDate:          visit.ScheduledDate,
		ScheduledStartTime:     visit.ScheduledStartTime,
		ScheduledEndTime:       visit.ScheduledEndTime,
		AuthorizationCode:      visit.AuthorizationCode,
		QRCode:                 visit.QRCode,
		QRCodeExpiresAt:        visit.QRCodeExpiresAt,
		AuthorizedByResidentID: visit.AuthorizedByResidentID,
		AuthorizationDate:      visit.AuthorizationDate,
		AuthorizationExpiresAt: visit.AuthorizationExpiresAt,
		RegisteredByUserID:     visit.RegisteredByUserID,
		Purpose:                visit.Purpose,
		NumberOfVisitors:       visit.NumberOfVisitors,
		HasCompanions:          visit.HasCompanions,
		HasAssets:              visit.HasAssets,
		Notes:                  visit.Notes,
		IsRecurring:            visit.IsRecurring,
		RecurringPatternID:     visit.RecurringPatternID,
		ParentVisitID:          visit.ParentVisitID,
		NotifyResident:         visit.NotifyResident,
		NotifySecurity:         visit.NotifySecurity,
	}

	if err := r.db.Conn(ctx).Create(model).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error creando visita")
		return nil, fmt.Errorf("error creando visita: %w", err)
	}

	// Cargar relaciones para mapear correctamente
	if err := r.db.Conn(ctx).Preload("Visitor").Preload("PropertyUnit").Preload("VisitType").Preload("VisitStatus").First(model, model.ID).Error; err != nil {
		return nil, fmt.Errorf("error cargando relaciones de visita: %w", err)
	}

	return mappers.VisitToDomain(model), nil
}

// GetVisitByID obtiene una visita por ID
func (r *VisitRepository) GetVisitByID(ctx context.Context, id uint) (*domain.Visit, error) {
	var visit models.Visit
	if err := r.db.Conn(ctx).
		Preload("Visitor").
		Preload("PropertyUnit").
		Preload("Resident").
		Preload("VisitType").
		Preload("VisitStatus").
		Preload("VisitorVehicle").
		First(&visit, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrVisitNotFound
		}
		return nil, fmt.Errorf("error obteniendo visita: %w", err)
	}

	return mappers.VisitToDomain(&visit), nil
}

// GetVisitByQRCode obtiene una visita por código QR
func (r *VisitRepository) GetVisitByQRCode(ctx context.Context, qrCode string) (*domain.Visit, error) {
	var visit models.Visit
	if err := r.db.Conn(ctx).
		Preload("Visitor").
		Preload("PropertyUnit").
		Preload("Resident").
		Preload("VisitType").
		Preload("VisitStatus").
		Preload("VisitorVehicle").
		Where("qr_code = ?", qrCode).
		First(&visit).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrVisitNotFound
		}
		return nil, fmt.Errorf("error obteniendo visita por QR: %w", err)
	}

	return mappers.VisitToDomain(&visit), nil
}

// GetVisitByAuthorizationCode obtiene una visita por código de autorización
func (r *VisitRepository) GetVisitByAuthorizationCode(ctx context.Context, authCode string) (*domain.Visit, error) {
	var visit models.Visit
	if err := r.db.Conn(ctx).
		Preload("Visitor").
		Preload("PropertyUnit").
		Preload("Resident").
		Preload("VisitType").
		Preload("VisitStatus").
		Preload("VisitorVehicle").
		Where("authorization_code = ?", authCode).
		First(&visit).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrVisitNotFound
		}
		return nil, fmt.Errorf("error obteniendo visita por código de autorización: %w", err)
	}

	return mappers.VisitToDomain(&visit), nil
}

// UpdateVisit actualiza una visita
// NOTA: No actualiza visit_status_id - usar ChangeVisitStatus para cambios de estado
func (r *VisitRepository) UpdateVisit(ctx context.Context, visit *domain.Visit) error {
	updates := map[string]interface{}{
		// visit_status_id se maneja exclusivamente por ChangeVisitStatus
		"property_unit_id":            visit.PropertyUnitID,
		"visit_type_id":               visit.VisitTypeID,
		"scheduled_date":              visit.ScheduledDate,
		"scheduled_start_time":        visit.ScheduledStartTime,
		"actual_entry_time":           visit.ActualEntryTime,
		"actual_exit_time":            visit.ActualExitTime,
		"duration_minutes":            visit.DurationMinutes,
		"entry_registered_by_user_id": visit.EntryRegisteredByUserID,
		"exit_registered_by_user_id":  visit.ExitRegisteredByUserID,
		"entry_gate":                  visit.EntryGate,
		"exit_gate":                   visit.ExitGate,
		"entry_method":                visit.EntryMethod,
		"duration_exceeded":           visit.DurationExceeded,
		"duration_exceeded_at":        visit.DurationExceededAt,
		"alert_sent":                  visit.AlertSent,
		"purpose":                     visit.Purpose,
		"number_of_visitors":          visit.NumberOfVisitors,
		"notes":                       visit.Notes,
		"notify_resident":             visit.NotifyResident,
		"notify_security":             visit.NotifySecurity,
	}

	if visit.ResidentID != nil {
		updates["resident_id"] = visit.ResidentID
	}
	if visit.ScheduledEndTime != nil {
		updates["scheduled_end_time"] = visit.ScheduledEndTime
	}
	if visit.AuthorizationDate != nil {
		updates["authorization_date"] = visit.AuthorizationDate
	}
	if visit.AuthorizationExpiresAt != nil {
		updates["authorization_expires_at"] = visit.AuthorizationExpiresAt
	}
	if visit.NotificationSentAt != nil {
		updates["notification_sent_at"] = visit.NotificationSentAt
	}

	if err := r.db.Conn(ctx).Model(&models.Visit{}).Where("id = ?", visit.ID).Updates(updates).Error; err != nil {
		return fmt.Errorf("error actualizando visita: %w", err)
	}

	return nil
}

// stayLimitSQL: minutos permitidos de permanencia según el tipo de visita.
const stayLimitSQL = "COALESCE(vt.max_duration_hours * 60, vt.default_duration_minutes)"

// exceedsSQL: la visita está dentro y pasó su tiempo (marcada por el back o entrada + límite < ahora).
const exceedsSQL = "(vs.code = 'in_progress' AND (v.duration_exceeded OR (v.actual_entry_time IS NOT NULL AND " +
	stayLimitSQL + " IS NOT NULL AND v.actual_entry_time + (" + stayLimitSQL + ") * INTERVAL '1 minute' < NOW())))"

// ListVisits lista visitas con filtros y paginación.
//
// Orden como las atiende la portería: dentro (las que exceden su tiempo primero), esperadas,
// salieron y canceladas; luego por día (el más reciente primero) y hora programada.
func (r *VisitRepository) ListVisits(ctx context.Context, filters domain.VisitFiltersDTO) (*domain.PaginatedVisitsDTO, error) {
	base := func() *gorm.DB {
		q := r.db.Conn(ctx).Table("horizontal_property.visits v").
			Joins("JOIN horizontal_property.visitors vis ON vis.id = v.visitor_id").
			Joins("JOIN horizontal_property.property_units pu ON pu.id = v.property_unit_id").
			Joins("JOIN horizontal_property.visit_types vt ON vt.id = v.visit_type_id").
			Joins("JOIN horizontal_property.visit_statuses vs ON vs.id = v.visit_status_id").
			Joins("LEFT JOIN horizontal_property.visitor_vehicles vv ON vv.id = v.visitor_vehicle_id").
			Joins("LEFT JOIN horizontal_property.residents r ON r.id = v.resident_id").
			Joins("LEFT JOIN horizontal_property.residents ar ON ar.id = v.authorized_by_resident_id").
			Where("v.deleted_at IS NULL")
		return applyVisitFilters(q, filters)
	}

	var total int64
	if err := base().Count(&total).Error; err != nil {
		return nil, fmt.Errorf("error contando visitas: %w", err)
	}

	type row struct {
		ID                 uint
		VisitorName        string
		VisitorDNI         string
		VisitorPhone       string
		VisitorID          uint
		PropertyUnitID     uint
		PropertyUnitNumber string
		PropertyUnitBlock  string
		VisitTypeName      string
		VisitStatusName    string
		VisitStatusCode    string
		ScheduledDate      time.Time
		ScheduledStartTime time.Time
		ScheduledEndTime   *time.Time
		ActualEntryTime    *time.Time
		ActualExitTime     *time.Time
		Purpose            string
		NumberOfVisitors   int
		CreatedAt          time.Time
		VisitorPlate       string
		AuthorizationCode  string
		EntryGate          string
		ResidentName       string
		AuthorizedByName   string
		StayLimitMinutes   *int
		ExceedsTime        bool
	}

	rows := []row{}
	offset := (filters.Page - 1) * filters.PageSize
	if err := base().
		Select("v.id, vis.full_name as visitor_name, vis.dni as visitor_dni, COALESCE(vis.phone, '') as visitor_phone, v.visitor_id, v.property_unit_id, " +
			"pu.number as property_unit_number, COALESCE(pu.block, '') as property_unit_block, " +
			"vt.name as visit_type_name, vs.name as visit_status_name, vs.code as visit_status_code, " +
			"v.scheduled_date, v.scheduled_start_time, v.scheduled_end_time, v.actual_entry_time, v.actual_exit_time, " +
			"COALESCE(v.purpose, '') as purpose, v.number_of_visitors, v.created_at, " +
			"COALESCE(vv.plate, '') as visitor_plate, COALESCE(v.authorization_code, '') as authorization_code, " +
			"COALESCE(v.entry_gate, '') as entry_gate, COALESCE(r.name, '') as resident_name, COALESCE(ar.name, '') as authorized_by_name, " +
			stayLimitSQL + " as stay_limit_minutes, " + exceedsSQL + " as exceeds_time").
		Order("CASE vs.code WHEN 'in_progress' THEN 0 WHEN 'pending' THEN 1 WHEN 'authorized' THEN 1 WHEN 'completed' THEN 2 ELSE 3 END, " +
			"CASE WHEN " + exceedsSQL + " THEN 0 ELSE 1 END, v.scheduled_date DESC, v.scheduled_start_time ASC, v.id DESC").
		Limit(filters.PageSize).
		Offset(offset).
		Scan(&rows).Error; err != nil {
		return nil, fmt.Errorf("error listando visitas: %w", err)
	}

	visits := make([]domain.VisitListDTO, len(rows))
	for i, rw := range rows {
		visits[i] = domain.VisitListDTO{
			ID:                  rw.ID,
			VisitorName:         rw.VisitorName,
			VisitorDNI:          rw.VisitorDNI,
			VisitorPhone:        rw.VisitorPhone,
			VisitorID:           rw.VisitorID,
			PropertyUnitID:      rw.PropertyUnitID,
			PropertyUnitNumber:  rw.PropertyUnitNumber,
			PropertyUnitBlock:   rw.PropertyUnitBlock,
			VisitTypeName:       rw.VisitTypeName,
			VisitStatusName:     rw.VisitStatusName,
			VisitStatusCode:     rw.VisitStatusCode,
			ScheduledDate:       rw.ScheduledDate,
			ScheduledStartTime:  rw.ScheduledStartTime,
			ScheduledEndTime:    rw.ScheduledEndTime,
			ActualEntryTime:     rw.ActualEntryTime,
			ActualExitTime:      rw.ActualExitTime,
			Purpose:             rw.Purpose,
			NumberOfVisitors:    rw.NumberOfVisitors,
			CreatedAt:           rw.CreatedAt,
			VisitorVehiclePlate: rw.VisitorPlate,
			AuthorizationCode:   rw.AuthorizationCode,
			EntryGate:           rw.EntryGate,
			ResidentName:        rw.ResidentName,
			AuthorizedByName:    rw.AuthorizedByName,
			StayLimitMinutes:    rw.StayLimitMinutes,
			ExceedsTime:         rw.ExceedsTime,
		}
	}

	return &domain.PaginatedVisitsDTO{
		Visits:     visits,
		Total:      total,
		Page:       filters.Page,
		PageSize:   filters.PageSize,
		TotalPages: int(math.Ceil(float64(total) / float64(filters.PageSize))),
	}, nil
}

// applyVisitFilters aplica los filtros de la lista (alias: v, vis, pu, vs).
func applyVisitFilters(q *gorm.DB, filters domain.VisitFiltersDTO) *gorm.DB {
	// business_id 0 = super admin sin negocio elegido: todas
	if filters.BusinessID > 0 {
		q = q.Where("v.business_id = ?", filters.BusinessID)
	}
	if filters.VisitorID != nil {
		q = q.Where("v.visitor_id = ?", *filters.VisitorID)
	}
	if filters.PropertyUnitID != nil {
		q = q.Where("v.property_unit_id = ?", *filters.PropertyUnitID)
	}
	if filters.ResidentID != nil {
		q = q.Where("v.resident_id = ?", *filters.ResidentID)
	}
	if filters.VisitTypeID != nil {
		q = q.Where("v.visit_type_id = ?", *filters.VisitTypeID)
	}
	if filters.VisitStatusID != nil {
		q = q.Where("v.visit_status_id = ?", *filters.VisitStatusID)
	}
	if codes, ok := domain.VisitStateGroups[filters.State]; ok {
		q = q.Where("vs.code IN ?", codes)
	}
	if filters.StartDate != nil {
		q = q.Where("v.scheduled_date >= ?", *filters.StartDate)
	}
	if filters.EndDate != nil {
		q = q.Where("v.scheduled_date <= ?", *filters.EndDate)
	}
	if filters.Search != "" {
		like := "%" + strings.ToLower(filters.Search) + "%"
		q = q.Where("(LOWER(vis.full_name) LIKE ? OR LOWER(vis.dni) LIKE ? OR LOWER(pu.number) LIKE ? "+
			"OR LOWER(COALESCE(pu.block, '') || ' ' || pu.number) LIKE ? OR LOWER(COALESCE(vv.plate, '')) LIKE ? "+
			"OR LOWER(COALESCE(v.authorization_code, '')) LIKE ? OR LOWER(COALESCE(v.qr_code, '')) LIKE ?)",
			like, like, like, like, like, like, like)
	}
	return q
}

// GetVisitsDayExtras calcula los datos de las tarjetas del día: excedidos dentro ahora,
// próxima visita esperada del día y estadía promedio de las que salieron.
func (r *VisitRepository) GetVisitsDayExtras(ctx context.Context, businessID uint, from time.Time, to time.Time) (*domain.VisitsDayExtras, error) {
	base := func() *gorm.DB {
		q := r.db.Conn(ctx).Table("horizontal_property.visits v").
			Joins("JOIN horizontal_property.visit_types vt ON vt.id = v.visit_type_id").
			Joins("JOIN horizontal_property.visit_statuses vs ON vs.id = v.visit_status_id").
			Joins("JOIN horizontal_property.property_units pu ON pu.id = v.property_unit_id").
			Where("v.deleted_at IS NULL")
		if businessID > 0 {
			q = q.Where("v.business_id = ?", businessID)
		}
		return q
	}
	extras := &domain.VisitsDayExtras{}

	if err := base().Where(exceedsSQL).Count(&extras.Exceeded).Error; err != nil {
		return nil, fmt.Errorf("error contando visitas excedidas: %w", err)
	}

	var next struct {
		ScheduledStartTime *time.Time
		Number             string
		Block              string
	}
	if err := base().Select("v.scheduled_start_time, pu.number, COALESCE(pu.block, '') as block").
		Where("vs.code IN ?", domain.VisitStateGroups[domain.VisitStateExpected]).
		Where("v.scheduled_date >= ? AND v.scheduled_date < ?", from, to).
		Order("v.scheduled_start_time ASC").Limit(1).Scan(&next).Error; err != nil {
		return nil, fmt.Errorf("error buscando la próxima visita: %w", err)
	}
	if next.ScheduledStartTime != nil {
		extras.NextExpectedAt = next.ScheduledStartTime
		extras.NextUnitNumber = next.Number
		extras.NextUnitBlock = next.Block
	}

	var avg struct{ Minutes *float64 }
	if err := base().Select("AVG(EXTRACT(EPOCH FROM (v.actual_exit_time - v.actual_entry_time)) / 60) as minutes").
		Where("vs.code = ?", "completed").
		Where("v.actual_entry_time IS NOT NULL AND v.actual_exit_time IS NOT NULL").
		Where("v.scheduled_date >= ? AND v.scheduled_date < ?", from, to).
		Scan(&avg).Error; err != nil {
		return nil, fmt.Errorf("error calculando la estadía promedio: %w", err)
	}
	if avg.Minutes != nil {
		m := int(math.Round(*avg.Minutes))
		extras.AvgStayMinutes = &m
	}
	return extras, nil
}

// CountVisitsByStatusCodes cuenta visitas del negocio con esos estados (y en el rango de días).
func (r *VisitRepository) CountVisitsByStatusCodes(ctx context.Context, businessID uint, codes []string, from *time.Time, to *time.Time) (int64, error) {
	q := r.db.Conn(ctx).Model(&models.Visit{}).
		Joins("JOIN horizontal_property.visit_statuses vs ON vs.id = visits.visit_status_id").
		Where("vs.code IN ?", codes)
	if businessID > 0 {
		q = q.Where("visits.business_id = ?", businessID)
	}
	if from != nil {
		q = q.Where("visits.scheduled_date >= ?", *from)
	}
	if to != nil {
		q = q.Where("visits.scheduled_date < ?", *to)
	}
	var total int64
	if err := q.Count(&total).Error; err != nil {
		return 0, fmt.Errorf("error contando visitas: %w", err)
	}
	return total, nil
}

// GetVisitStatusByCode obtiene un estado de visita por código (retorna entidad de dominio)
func (r *VisitRepository) GetVisitStatusByCode(ctx context.Context, code string) (*domain.VisitStatus, error) {
	var status models.VisitStatus
	if err := r.db.Conn(ctx).Where("code = ?", code).First(&status).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo estado de visita: %w", err)
	}
	return &domain.VisitStatus{
		ID:          status.ID,
		Code:        status.Code,
		Name:        status.Name,
		Description: status.Description,
		IsFinal:     status.IsFinal,
		IsActive:    status.IsActive,
	}, nil
}

// GetActiveVisits obtiene visitas activas (en progreso)
func (r *VisitRepository) GetActiveVisits(ctx context.Context, businessID uint) ([]*domain.Visit, error) {
	var visits []models.Visit
	var status models.VisitStatus

	// Buscar el estado "in_progress"
	if err := r.db.Conn(ctx).Where("code = ?", "in_progress").First(&status).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo estado in_progress: %w", err)
	}

	if err := r.db.Conn(ctx).
		Preload("Visitor").
		Preload("PropertyUnit").
		Preload("VisitType").
		Preload("VisitStatus").
		Where("business_id = ? AND visit_status_id = ?", businessID, status.ID).
		Find(&visits).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo visitas activas: %w", err)
	}

	result := make([]*domain.Visit, len(visits))
	for i, v := range visits {
		result[i] = mappers.VisitToDomain(&v)
	}

	return result, nil
}

// GetVisitTypes obtiene todos los tipos de visita activos
func (r *VisitRepository) GetVisitTypes(ctx context.Context, businessID uint) ([]*domain.VisitType, error) {
	var types []models.VisitType
	if err := r.db.Conn(ctx).Where("is_active = ?", true).Order("name ASC").Find(&types).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo tipos de visita: %w", err)
	}

	result := make([]*domain.VisitType, len(types))
	for i, t := range types {
		result[i] = &domain.VisitType{
			ID:                          t.ID,
			Name:                        t.Name,
			Code:                        t.Code,
			Description:                 t.Description,
			RequiresAuthorization:       t.RequiresAuthorization,
			RequiresVehicleRegistration: t.RequiresVehicleRegistration,
			RequiresCompanions:          t.RequiresCompanions,
			RequiresAssetsTracking:      t.RequiresAssetsTracking,
			MaxDurationHours:            t.MaxDurationHours,
			DefaultDurationMinutes:      t.DefaultDurationMinutes,
			IsActive:                    t.IsActive,
		}
	}

	return result, nil
}

// GetVisitStatuses obtiene todos los estados de visita activos
func (r *VisitRepository) GetVisitStatuses(ctx context.Context) ([]*domain.VisitStatus, error) {
	var statuses []models.VisitStatus
	if err := r.db.Conn(ctx).Where("is_active = ?", true).Order("id ASC").Find(&statuses).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo estados de visita: %w", err)
	}

	result := make([]*domain.VisitStatus, len(statuses))
	for i, s := range statuses {
		result[i] = &domain.VisitStatus{
			ID:          s.ID,
			Code:        s.Code,
			Name:        s.Name,
			Description: s.Description,
			IsFinal:     s.IsFinal,
			IsActive:    s.IsActive,
		}
	}

	return result, nil
}

// GetVisitWithRelations obtiene una visita con sus relaciones completas para state machine
func (r *VisitRepository) GetVisitWithRelations(ctx context.Context, visitID uint) (*domain.Visit, *domain.VisitType, *domain.VisitStatus, error) {
	var visit models.Visit
	if err := r.db.Conn(ctx).
		Preload("VisitStatus").
		Preload("VisitType").
		Preload("Visitor").
		Preload("PropertyUnit").
		First(&visit, visitID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil, nil, domain.ErrVisitNotFound
		}
		return nil, nil, nil, fmt.Errorf("error obteniendo visita: %w", err)
	}

	visitDomain := mappers.VisitToDomain(&visit)

	visitType := &domain.VisitType{
		ID:                          visit.VisitType.ID,
		Name:                        visit.VisitType.Name,
		Code:                        visit.VisitType.Code,
		Description:                 visit.VisitType.Description,
		RequiresAuthorization:       visit.VisitType.RequiresAuthorization,
		RequiresVehicleRegistration: visit.VisitType.RequiresVehicleRegistration,
		RequiresCompanions:          visit.VisitType.RequiresCompanions,
		RequiresAssetsTracking:      visit.VisitType.RequiresAssetsTracking,
		MaxDurationHours:            visit.VisitType.MaxDurationHours,
		DefaultDurationMinutes:      visit.VisitType.DefaultDurationMinutes,
		IsActive:                    visit.VisitType.IsActive,
	}

	visitStatus := &domain.VisitStatus{
		ID:          visit.VisitStatus.ID,
		Code:        visit.VisitStatus.Code,
		Name:        visit.VisitStatus.Name,
		Description: visit.VisitStatus.Description,
		IsFinal:     visit.VisitStatus.IsFinal,
		IsActive:    visit.VisitStatus.IsActive,
	}

	return visitDomain, visitType, visitStatus, nil
}

// ChangeVisitStatus cambia el estado de una visita validando las transiciones
func (r *VisitRepository) ChangeVisitStatus(ctx context.Context, visitID uint, newStatusCode string) error {
	// Obtener el nuevo estado por código
	var newStatus models.VisitStatus
	if err := r.db.Conn(ctx).Where("code = ?", newStatusCode).First(&newStatus).Error; err != nil {
		return fmt.Errorf("estado no encontrado: %s", newStatusCode)
	}

	// Actualizar el estado de la visita
	if err := r.db.Conn(ctx).Model(&models.Visit{}).
		Where("id = ?", visitID).
		Update("visit_status_id", newStatus.ID).Error; err != nil {
		return fmt.Errorf("error actualizando estado de visita: %w", err)
	}

	return nil
}

// SaveVisit guarda los cambios de una visita (usa UpdateVisit internamente)
func (r *VisitRepository) SaveVisit(ctx context.Context, visit *domain.Visit) error {
	return r.UpdateVisit(ctx, visit)
}

// GetPropertyUnitBusinessID obtiene el business_id de una property_unit
func (r *VisitRepository) GetPropertyUnitBusinessID(ctx context.Context, propertyUnitID uint) (uint, error) {
	var propertyUnit models.PropertyUnit
	if err := r.db.Conn(ctx).Select("business_id").First(&propertyUnit, propertyUnitID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return 0, fmt.Errorf("unidad de propiedad no encontrada")
		}
		return 0, fmt.Errorf("error obteniendo unidad de propiedad: %w", err)
	}
	if propertyUnit.BusinessID == 0 {
		return 0, fmt.Errorf("la unidad de propiedad no tiene un business_id válido")
	}
	return propertyUnit.BusinessID, nil
}
