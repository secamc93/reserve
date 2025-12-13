package repository

import (
	"context"
	"fmt"
	"strings"
	"time"

	"central_reserve/services/horizontalproperty/dashboard/internal/domain"
	"central_reserve/shared/db"
	"central_reserve/shared/env"
	"central_reserve/shared/log"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

type DashboardRepository struct {
	db     db.IDatabase
	env    env.IConfig
	logger log.ILogger
}

func New(db db.IDatabase, env env.IConfig, logger log.ILogger) *DashboardRepository {
	return &DashboardRepository{
		db:     db,
		env:    env,
		logger: logger,
	}
}

// GetDashboardSummary obtiene el resumen general del dashboard para un business
func (r *DashboardRepository) GetDashboardSummary(ctx context.Context, businessID uint) (*domain.DashboardSummary, error) {
	var summary domain.DashboardSummary
	summary.BusinessID = businessID

	conn := r.db.Conn(ctx)

	// Obtener nombre del business si existe
	if businessID > 0 {
		var business models.Business
		if err := conn.First(&business, businessID).Error; err == nil {
			summary.BusinessName = business.Name
		}
	}

	// Total de propiedades horizontales (se cuenta por business_id único en unidades)
	// Como no hay tabla de propiedades horizontales, contamos businesses únicos que tienen unidades
	var uniqueBusinesses int64
	if businessID > 0 {
		// Si es un business específico, solo puede tener 1 propiedad horizontal
		summary.TotalHorizontalProperties = 1
	} else {
		// Para super admin, contar businesses únicos que tienen unidades
		if err := conn.Model(&models.PropertyUnit{}).
			Distinct("business_id").
			Count(&uniqueBusinesses).Error; err != nil {
			r.logger.Error(ctx).Err(err).Msg("Error contando propiedades horizontales")
		} else {
			summary.TotalHorizontalProperties = uniqueBusinesses
		}
	}

	// Total de unidades
	var unitsQuery *gorm.DB = conn.Model(&models.PropertyUnit{})
	if businessID > 0 {
		unitsQuery = unitsQuery.Where("business_id = ?", businessID)
	}
	if err := unitsQuery.Count(&summary.TotalUnits).Error; err != nil {
		r.logger.Error(ctx).Err(err).Msg("Error contando unidades")
	}

	// Total de residentes
	var residentsQuery *gorm.DB = conn.Model(&models.Resident{})
	if businessID > 0 {
		residentsQuery = residentsQuery.Where("business_id = ?", businessID)
	}
	if err := residentsQuery.Count(&summary.TotalResidents).Error; err != nil {
		r.logger.Error(ctx).Err(err).Msg("Error contando residentes")
	}

	// Total de grupos de votación
	var vgQuery *gorm.DB = conn.Model(&models.VotingGroup{})
	if businessID > 0 {
		vgQuery = vgQuery.Where("business_id = ?", businessID)
	}
	if err := vgQuery.Count(&summary.TotalVotingGroups).Error; err != nil {
		r.logger.Error(ctx).Err(err).Msg("Error contando grupos de votación")
	}

	// Votaciones activas (grupos de votación activos con fechas válidas)
	now := time.Now()
	var activeVotingsQuery *gorm.DB = conn.Model(&models.VotingGroup{}).
		Where("is_active = ? AND voting_start_date <= ? AND voting_end_date >= ?", true, now, now)
	if businessID > 0 {
		activeVotingsQuery = activeVotingsQuery.Where("business_id = ?", businessID)
	}
	if err := activeVotingsQuery.Count(&summary.ActiveVotings).Error; err != nil {
		r.logger.Error(ctx).Err(err).Msg("Error contando votaciones activas")
	}

	// Votaciones completadas (grupos de votación con fecha de fin pasada)
	var completedVotingsQuery *gorm.DB = conn.Model(&models.VotingGroup{}).
		Where("voting_end_date < ?", now)
	if businessID > 0 {
		completedVotingsQuery = completedVotingsQuery.Where("business_id = ?", businessID)
	}
	if err := completedVotingsQuery.Count(&summary.CompletedVotings).Error; err != nil {
		r.logger.Error(ctx).Err(err).Msg("Error contando votaciones completadas")
	}

	// Total de listas de asistencia
	var alQuery *gorm.DB = conn.Model(&models.AttendanceList{}).
		Joins("JOIN horizontal_property.voting_groups vg ON attendance_lists.voting_group_id = vg.id")
	if businessID > 0 {
		alQuery = alQuery.Where("vg.business_id = ?", businessID)
	}
	if err := alQuery.Count(&summary.TotalAttendanceLists).Error; err != nil {
		r.logger.Error(ctx).Err(err).Msg("Error contando listas de asistencia")
	}

	// Listas de asistencia activas
	var activeALQuery *gorm.DB = conn.Model(&models.AttendanceList{}).
		Joins("JOIN horizontal_property.voting_groups vg ON attendance_lists.voting_group_id = vg.id").
		Where("attendance_lists.is_active = ?", true)
	if businessID > 0 {
		activeALQuery = activeALQuery.Where("vg.business_id = ?", businessID)
	}
	if err := activeALQuery.Count(&summary.ActiveAttendanceLists).Error; err != nil {
		r.logger.Error(ctx).Err(err).Msg("Error contando listas de asistencia activas")
	}

	// Total de votos
	var votesQuery *gorm.DB = conn.Model(&models.Vote{}).
		Joins("JOIN horizontal_property.votings v ON votes.voting_id = v.id").
		Joins("JOIN horizontal_property.voting_groups vg ON v.voting_group_id = vg.id")
	if businessID > 0 {
		votesQuery = votesQuery.Where("vg.business_id = ?", businessID)
	}
	if err := votesQuery.Count(&summary.TotalVotes).Error; err != nil {
		r.logger.Error(ctx).Err(err).Msg("Error contando votos")
	}

	// Total de apoderados
	var proxiesQuery *gorm.DB = conn.Model(&models.Proxy{})
	if businessID > 0 {
		proxiesQuery = proxiesQuery.Where("business_id = ?", businessID)
	}
	if err := proxiesQuery.Count(&summary.TotalProxies).Error; err != nil {
		r.logger.Error(ctx).Err(err).Msg("Error contando apoderados")
	}

	return &summary, nil
}

// GetVotingStatistics obtiene estadísticas de votaciones
func (r *DashboardRepository) GetVotingStatistics(ctx context.Context, businessID uint) (*domain.VotingStatistics, error) {
	var stats domain.VotingStatistics
	conn := r.db.Conn(ctx)

	// Usar VotingGroup como base ya que las fechas están ahí
	baseQuery := conn.Model(&models.VotingGroup{})

	if businessID > 0 {
		baseQuery = baseQuery.Where("business_id = ?", businessID)
	}

	now := time.Now()

	// Total de votaciones (grupos de votación)
	if err := baseQuery.Count(&stats.TotalVotings).Error; err != nil {
		r.logger.Error(ctx).Err(err).Msg("Error contando total de votaciones")
	}

	// Votaciones activas (grupos activos con fechas válidas)
	activeQuery := conn.Model(&models.VotingGroup{}).
		Where("is_active = ? AND voting_start_date <= ? AND voting_end_date >= ?", true, now, now)
	if businessID > 0 {
		activeQuery = activeQuery.Where("business_id = ?", businessID)
	}
	if err := activeQuery.Count(&stats.ActiveVotings).Error; err != nil {
		r.logger.Error(ctx).Err(err).Msg("Error contando votaciones activas")
	}

	// Votaciones completadas (fecha de fin pasada)
	completedQuery := conn.Model(&models.VotingGroup{}).
		Where("voting_end_date < ?", now)
	if businessID > 0 {
		completedQuery = completedQuery.Where("business_id = ?", businessID)
	}
	if err := completedQuery.Count(&stats.CompletedVotings).Error; err != nil {
		r.logger.Error(ctx).Err(err).Msg("Error contando votaciones completadas")
	}

	// Votaciones pendientes (aún no iniciadas)
	pendingQuery := conn.Model(&models.VotingGroup{}).
		Where("voting_start_date > ?", now)
	if businessID > 0 {
		pendingQuery = pendingQuery.Where("business_id = ?", businessID)
	}
	if err := pendingQuery.Count(&stats.PendingVotings).Error; err != nil {
		r.logger.Error(ctx).Err(err).Msg("Error contando votaciones pendientes")
	}

	// Total de votos
	votesQuery := conn.Model(&models.Vote{}).
		Joins("JOIN horizontal_property.votings v ON votes.voting_id = v.id").
		Joins("JOIN horizontal_property.voting_groups vg ON v.voting_group_id = vg.id")
	if businessID > 0 {
		votesQuery = votesQuery.Where("vg.business_id = ?", businessID)
	}
	if err := votesQuery.Count(&stats.TotalVotes).Error; err != nil {
		r.logger.Error(ctx).Err(err).Msg("Error contando total de votos")
	}

	// Total de grupos de votación
	vgQuery := conn.Model(&models.VotingGroup{})
	if businessID > 0 {
		vgQuery = vgQuery.Where("business_id = ?", businessID)
	}
	if err := vgQuery.Count(&stats.TotalVotingGroups).Error; err != nil {
		r.logger.Error(ctx).Err(err).Msg("Error contando grupos de votación")
	}

	// Grupos de votación activos
	activeVGQuery := conn.Model(&models.VotingGroup{}).Where("is_active = ?", true)
	if businessID > 0 {
		activeVGQuery = activeVGQuery.Where("business_id = ?", businessID)
	}
	if err := activeVGQuery.Count(&stats.ActiveVotingGroups).Error; err != nil {
		r.logger.Error(ctx).Err(err).Msg("Error contando grupos de votación activos")
	}

	return &stats, nil
}

// GetAttendanceStatistics obtiene estadísticas de asistencia
func (r *DashboardRepository) GetAttendanceStatistics(ctx context.Context, businessID uint) (*domain.AttendanceStatistics, error) {
	var stats domain.AttendanceStatistics
	conn := r.db.Conn(ctx)

	baseQuery := conn.Model(&models.AttendanceList{}).
		Joins("JOIN horizontal_property.voting_groups vg ON attendance_lists.voting_group_id = vg.id")

	if businessID > 0 {
		baseQuery = baseQuery.Where("vg.business_id = ?", businessID)
	}

	// Total de listas
	if err := baseQuery.Count(&stats.TotalLists).Error; err != nil {
		r.logger.Error(ctx).Err(err).Msg("Error contando listas de asistencia")
	}

	// Listas activas
	activeQuery := conn.Model(&models.AttendanceList{}).
		Joins("JOIN horizontal_property.voting_groups vg ON attendance_lists.voting_group_id = vg.id").
		Where("attendance_lists.is_active = ?", true)
	if businessID > 0 {
		activeQuery = activeQuery.Where("vg.business_id = ?", businessID)
	}
	if err := activeQuery.Count(&stats.ActiveLists).Error; err != nil {
		r.logger.Error(ctx).Err(err).Msg("Error contando listas activas")
	}

	// Total de registros de asistencia
	recordsQuery := conn.Model(&models.AttendanceRecord{}).
		Joins("JOIN horizontal_property.attendance_lists al ON attendance_records.attendance_list_id = al.id").
		Joins("JOIN horizontal_property.voting_groups vg ON al.voting_group_id = vg.id")
	if businessID > 0 {
		recordsQuery = recordsQuery.Where("vg.business_id = ?", businessID)
	}
	if err := recordsQuery.Count(&stats.TotalRecords).Error; err != nil {
		r.logger.Error(ctx).Err(err).Msg("Error contando registros de asistencia")
	}

	// Registros con asistencia confirmada
	attendedQuery := conn.Model(&models.AttendanceRecord{}).
		Joins("JOIN horizontal_property.attendance_lists al ON attendance_records.attendance_list_id = al.id").
		Joins("JOIN horizontal_property.voting_groups vg ON al.voting_group_id = vg.id").
		Where("(attendance_records.attended_as_owner = ? OR attendance_records.attended_as_proxy = ?)", true, true)
	if businessID > 0 {
		attendedQuery = attendedQuery.Where("vg.business_id = ?", businessID)
	}
	if err := attendedQuery.Count(&stats.AttendedRecords).Error; err != nil {
		r.logger.Error(ctx).Err(err).Msg("Error contando registros con asistencia")
	}

	// Registros pendientes
	stats.PendingRecords = stats.TotalRecords - stats.AttendedRecords

	// Total de apoderados
	proxiesQuery := conn.Model(&models.Proxy{})
	if businessID > 0 {
		proxiesQuery = proxiesQuery.Where("business_id = ?", businessID)
	}
	if err := proxiesQuery.Count(&stats.TotalProxies).Error; err != nil {
		r.logger.Error(ctx).Err(err).Msg("Error contando apoderados")
	}

	return &stats, nil
}

// GetBusinessSummaries obtiene resúmenes de todos los businesses de tipo propiedad horizontal (solo para super admin) con paginación
func (r *DashboardRepository) GetBusinessSummaries(ctx context.Context, page, pageSize int) ([]domain.BusinessSummary, int64, error) {
	var businesses []models.Business
	var total int64
	conn := r.db.Conn(ctx)

	// Validar y normalizar parámetros de paginación
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}
	if pageSize > 100 {
		pageSize = 100
	}

	// Filtrar solo businesses de tipo "Propiedad Horizontal" (business_type_id = 11)
	// Obtener el ID del tipo de negocio "Propiedad Horizontal"
	var businessType models.BusinessType
	query := conn.Model(&models.Business{}).Where("is_active = ?", true)

	if err := conn.Where("code = ?", "horizontal_property").First(&businessType).Error; err != nil {
		r.logger.Warn(ctx).Msg("No se encontró el tipo de negocio 'horizontal_property', usando business_type_id = 11")
		query = query.Where("business_type_id = ?", 11)
	} else {
		query = query.Where("business_type_id = ?", businessType.ID)
	}

	// Contar total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("error contando businesses: %w", err)
	}

	// Aplicar paginación
	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&businesses).Error; err != nil {
		return nil, 0, fmt.Errorf("error obteniendo businesses: %w", err)
	}

	// Procesar URLs de imágenes
	baseURL := strings.TrimRight(r.env.Get("URL_BASE_DOMAIN_S3"), "/")

	summaries := make([]domain.BusinessSummary, 0, len(businesses))
	for _, business := range businesses {
		summary, err := r.GetBusinessSummary(ctx, business.ID)
		if err != nil {
			r.logger.Error(ctx).Err(err).Uint("business_id", business.ID).Msg("Error obteniendo resumen de business")
			continue
		}

		// Agregar información adicional del business
		summary.BusinessTypeID = business.BusinessTypeID

		// Procesar LogoURL: convertir a URL completa si es relativo
		if business.LogoURL != "" {
			if strings.HasPrefix(business.LogoURL, "http") {
				summary.LogoURL = business.LogoURL
			} else if baseURL != "" {
				summary.LogoURL = fmt.Sprintf("%s/%s", baseURL, strings.TrimLeft(business.LogoURL, "/"))
			} else {
				summary.LogoURL = business.LogoURL
			}
		}

		summaries = append(summaries, *summary)
	}

	return summaries, total, nil
}

// GetBusinessSummary obtiene resumen de un business específico
func (r *DashboardRepository) GetBusinessSummary(ctx context.Context, businessID uint) (*domain.BusinessSummary, error) {
	var summary domain.BusinessSummary
	summary.BusinessID = businessID

	conn := r.db.Conn(ctx)

	// Obtener nombre del business
	var business models.Business
	if err := conn.First(&business, businessID).Error; err != nil {
		return nil, fmt.Errorf("business no encontrado: %w", err)
	}
	summary.BusinessName = business.Name
	summary.LogoURL = business.LogoURL
	summary.BusinessTypeID = business.BusinessTypeID

	// Total de propiedades horizontales (1 por business)
	summary.TotalHorizontalProperties = 1

	// Total de unidades
	if err := conn.Model(&models.PropertyUnit{}).
		Where("business_id = ?", businessID).
		Count(&summary.TotalUnits).Error; err != nil {
		r.logger.Error(ctx).Err(err).Msg("Error contando unidades")
	}

	// Total de residentes
	if err := conn.Model(&models.Resident{}).
		Where("business_id = ?", businessID).
		Count(&summary.TotalResidents).Error; err != nil {
		r.logger.Error(ctx).Err(err).Msg("Error contando residentes")
	}

	// Votaciones activas (grupos de votación activos con fechas válidas)
	now := time.Now()
	if err := conn.Model(&models.VotingGroup{}).
		Where("business_id = ? AND is_active = ? AND voting_start_date <= ? AND voting_end_date >= ?",
			businessID, true, now, now).
		Count(&summary.ActiveVotings).Error; err != nil {
		r.logger.Error(ctx).Err(err).Msg("Error contando votaciones activas")
	}

	// Listas de asistencia activas
	if err := conn.Model(&models.AttendanceList{}).
		Joins("JOIN horizontal_property.voting_groups vg ON attendance_lists.voting_group_id = vg.id").
		Where("vg.business_id = ? AND attendance_lists.is_active = ?", businessID, true).
		Count(&summary.ActiveAttendanceLists).Error; err != nil {
		r.logger.Error(ctx).Err(err).Msg("Error contando listas de asistencia activas")
	}

	// Última actividad (máxima fecha de actualización entre votaciones y listas)
	var lastVotingUpdate time.Time
	var lastListUpdate time.Time

	conn.Model(&models.Voting{}).
		Joins("JOIN horizontal_property.voting_groups vg ON votings.voting_group_id = vg.id").
		Where("vg.business_id = ?", businessID).
		Select("COALESCE(MAX(votings.updated_at), '1970-01-01'::timestamp)").
		Scan(&lastVotingUpdate)

	conn.Model(&models.AttendanceList{}).
		Joins("JOIN horizontal_property.voting_groups vg ON attendance_lists.voting_group_id = vg.id").
		Where("vg.business_id = ?", businessID).
		Select("COALESCE(MAX(attendance_lists.updated_at), '1970-01-01'::timestamp)").
		Scan(&lastListUpdate)

	if lastVotingUpdate.After(lastListUpdate) {
		summary.LastActivity = &lastVotingUpdate
	} else if !lastListUpdate.IsZero() {
		summary.LastActivity = &lastListUpdate
	}

	return &summary, nil
}

