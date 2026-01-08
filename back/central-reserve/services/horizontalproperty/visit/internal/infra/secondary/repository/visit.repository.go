package repository

import (
	"context"
	"fmt"
	"math"
	"time"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
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

	return mapVisitToDomain(model), nil
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

	return mapVisitToDomain(&visit), nil
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

	return mapVisitToDomain(&visit), nil
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

	return mapVisitToDomain(&visit), nil
}

// UpdateVisit actualiza una visita
func (r *VisitRepository) UpdateVisit(ctx context.Context, visit *domain.Visit) error {
	updates := map[string]interface{}{
		"visit_status_id":             visit.VisitStatusID,
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

// ListVisits lista visitas con filtros y paginación
func (r *VisitRepository) ListVisits(ctx context.Context, filters domain.VisitFiltersDTO) (*domain.PaginatedVisitsDTO, error) {
	// Conteo total
	var total int64
	countQuery := r.db.Conn(ctx).Model(&models.Visit{})
	
	// Si BusinessID > 0, filtrar por negocio; si es 0 (super admin), mostrar todas
	if filters.BusinessID > 0 {
		countQuery = countQuery.Where("business_id = ?", filters.BusinessID)
	}

	if filters.VisitorID != nil {
		countQuery = countQuery.Where("visitor_id = ?", *filters.VisitorID)
	}
	if filters.PropertyUnitID != nil {
		countQuery = countQuery.Where("property_unit_id = ?", *filters.PropertyUnitID)
	}
	if filters.ResidentID != nil {
		countQuery = countQuery.Where("resident_id = ?", *filters.ResidentID)
	}
	if filters.VisitTypeID != nil {
		countQuery = countQuery.Where("visit_type_id = ?", *filters.VisitTypeID)
	}
	if filters.VisitStatusID != nil {
		countQuery = countQuery.Where("visit_status_id = ?", *filters.VisitStatusID)
	}
	if filters.StartDate != nil {
		countQuery = countQuery.Where("scheduled_date >= ?", *filters.StartDate)
	}
	if filters.EndDate != nil {
		countQuery = countQuery.Where("scheduled_date <= ?", *filters.EndDate)
	}

	if err := countQuery.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("error contando visitas: %w", err)
	}

	// Consulta paginada
	type row struct {
		ID                 uint
		VisitorName        string
		VisitorDNI         string
		PropertyUnitNumber string
		VisitTypeName      string
		VisitStatusName    string
		ScheduledDate      time.Time
		ActualEntryTime    *time.Time
		ActualExitTime     *time.Time
		CreatedAt          time.Time
	}

	rows := []row{}
	query := r.db.Conn(ctx).Table("horizontal_property.visits v").
		Select("v.id, vis.full_name as visitor_name, vis.dni as visitor_dni, pu.number as property_unit_number, "+
			"vt.name as visit_type_name, vs.name as visit_status_name, v.scheduled_date, "+
			"v.actual_entry_time, v.actual_exit_time, v.created_at").
		Joins("JOIN horizontal_property.visitors vis ON vis.id = v.visitor_id").
		Joins("JOIN horizontal_property.property_units pu ON pu.id = v.property_unit_id").
		Joins("JOIN horizontal_property.visit_types vt ON vt.id = v.visit_type_id").
		Joins("JOIN horizontal_property.visit_statuses vs ON vs.id = v.visit_status_id")
	
	// Si BusinessID > 0, filtrar por negocio; si es 0 (super admin), mostrar todas
	if filters.BusinessID > 0 {
		query = query.Where("v.business_id = ?", filters.BusinessID)
	}

	if filters.VisitorID != nil {
		query = query.Where("v.visitor_id = ?", *filters.VisitorID)
	}
	if filters.PropertyUnitID != nil {
		query = query.Where("v.property_unit_id = ?", *filters.PropertyUnitID)
	}
	if filters.ResidentID != nil {
		query = query.Where("v.resident_id = ?", *filters.ResidentID)
	}
	if filters.VisitTypeID != nil {
		query = query.Where("v.visit_type_id = ?", *filters.VisitTypeID)
	}
	if filters.VisitStatusID != nil {
		query = query.Where("v.visit_status_id = ?", *filters.VisitStatusID)
	}
	if filters.StartDate != nil {
		query = query.Where("v.scheduled_date >= ?", *filters.StartDate)
	}
	if filters.EndDate != nil {
		query = query.Where("v.scheduled_date <= ?", *filters.EndDate)
	}

	offset := (filters.Page - 1) * filters.PageSize
	if err := query.Order("v.scheduled_date DESC, v.created_at DESC").
		Limit(filters.PageSize).
		Offset(offset).
		Scan(&rows).Error; err != nil {
		return nil, fmt.Errorf("error listando visitas: %w", err)
	}

	visits := make([]domain.VisitListDTO, len(rows))
	for i, rw := range rows {
		visits[i] = domain.VisitListDTO{
			ID:                 rw.ID,
			VisitorName:        rw.VisitorName,
			VisitorDNI:         rw.VisitorDNI,
			PropertyUnitNumber: rw.PropertyUnitNumber,
			VisitTypeName:      rw.VisitTypeName,
			VisitStatusName:    rw.VisitStatusName,
			ScheduledDate:      rw.ScheduledDate,
			ActualEntryTime:    rw.ActualEntryTime,
			ActualExitTime:     rw.ActualExitTime,
			CreatedAt:          rw.CreatedAt,
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

// GetVisitStatusByCode obtiene un estado de visita por código
func (r *VisitRepository) GetVisitStatusByCode(ctx context.Context, code string) (*models.VisitStatus, error) {
	var status models.VisitStatus
	if err := r.db.Conn(ctx).Where("code = ?", code).First(&status).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo estado de visita: %w", err)
	}
	return &status, nil
}

// GetDB retorna la conexión de base de datos (helper para casos de uso)
func (r *VisitRepository) GetDB(ctx context.Context) *gorm.DB {
	return r.db.Conn(ctx)
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
		result[i] = mapVisitToDomain(&v)
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

// mapVisitToDomain mapea modelo a entidad de dominio
func mapVisitToDomain(m *models.Visit) *domain.Visit {
	return &domain.Visit{
		ID:                      m.ID,
		BusinessID:              m.BusinessID,
		VisitorID:               m.VisitorID,
		PropertyUnitID:          m.PropertyUnitID,
		ResidentID:              m.ResidentID,
		VisitTypeID:             m.VisitTypeID,
		VisitStatusID:           m.VisitStatusID,
		VisitorVehicleID:        m.VisitorVehicleID,
		ScheduledDate:           m.ScheduledDate,
		ScheduledStartTime:      m.ScheduledStartTime,
		ScheduledEndTime:        m.ScheduledEndTime,
		ActualEntryTime:         m.ActualEntryTime,
		ActualExitTime:          m.ActualExitTime,
		DurationMinutes:         m.DurationMinutes,
		AuthorizationCode:       m.AuthorizationCode,
		QRCode:                  m.QRCode,
		QRCodeExpiresAt:         m.QRCodeExpiresAt,
		AuthorizedByResidentID:  m.AuthorizedByResidentID,
		AuthorizationDate:       m.AuthorizationDate,
		AuthorizationExpiresAt:  m.AuthorizationExpiresAt,
		RegisteredByUserID:      m.RegisteredByUserID,
		EntryRegisteredByUserID: m.EntryRegisteredByUserID,
		ExitRegisteredByUserID:  m.ExitRegisteredByUserID,
		EntryGate:               m.EntryGate,
		ExitGate:                m.ExitGate,
		EntryMethod:             m.EntryMethod,
		Purpose:                 m.Purpose,
		NumberOfVisitors:        m.NumberOfVisitors,
		HasCompanions:           m.HasCompanions,
		HasAssets:               m.HasAssets,
		Notes:                   m.Notes,
		IsRecurring:             m.IsRecurring,
		RecurringPatternID:      m.RecurringPatternID,
		ParentVisitID:           m.ParentVisitID,
		DurationExceeded:        m.DurationExceeded,
		DurationExceededAt:      m.DurationExceededAt,
		AlertSent:               m.AlertSent,
		NotifyResident:          m.NotifyResident,
		NotifySecurity:          m.NotifySecurity,
		NotificationSentAt:      m.NotificationSentAt,
		CreatedAt:               m.CreatedAt,
		UpdatedAt:               m.UpdatedAt,
	}
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
