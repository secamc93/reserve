package secondary

import (
	"context"
	"reserve/testing/modules/visit/internal/domain"
	"reserve/testing/shared"
	"strings"
)

// DatabaseAdapter implementa DatabasePort usando TestDatabase
type DatabaseAdapter struct {
	db *shared.TestDatabase
}

// NewDatabaseAdapter crea una nueva instancia de DatabaseAdapter
func NewDatabaseAdapter(db *shared.TestDatabase) *DatabaseAdapter {
	return &DatabaseAdapter{
		db: db,
	}
}

// ListVisitorsFromDB lista visitantes desde la BD
func (a *DatabaseAdapter) ListVisitorsFromDB(ctx context.Context) ([]domain.Visitor, error) {
	type VisitorModel struct {
		ID       uint   `gorm:"column:id"`
		DNI      string `gorm:"column:dni"`
		FullName string `gorm:"column:full_name"`
		Phone    string `gorm:"column:phone"`
		Email    string `gorm:"column:email"`
	}

	var models []VisitorModel
	result := a.db.Conn().
		Table("visitor").
		Select("id, dni, full_name, phone, email").
		Order("id DESC").
		Limit(20).
		Find(&models)

	if result.Error != nil {
		return nil, result.Error
	}

	visitors := make([]domain.Visitor, len(models))
	for i, m := range models {
		visitors[i] = domain.Visitor{
			ID:       m.ID,
			DNI:      m.DNI,
			FullName: m.FullName,
			Phone:    m.Phone,
			Email:    m.Email,
		}
	}

	return visitors, nil
}

// ListVisitsFromDB lista visitas desde la BD
func (a *DatabaseAdapter) ListVisitsFromDB(ctx context.Context, businessID uint) ([]domain.Visit, error) {
	type VisitModel struct {
		ID              uint    `gorm:"column:id"`
		VisitorID       uint    `gorm:"column:visitor_id"`
		PropertyUnitID  uint    `gorm:"column:property_unit_id"`
		VisitStatusID   uint    `gorm:"column:visit_status_id"`
		VisitTypeID     uint    `gorm:"column:visit_type_id"`
		Purpose         string  `gorm:"column:purpose"`
		ScheduledDate   string  `gorm:"column:scheduled_date"`
		ActualEntryTime *string `gorm:"column:actual_entry_time"`
		ActualExitTime  *string `gorm:"column:actual_exit_time"`
	}

	var models []VisitModel
	result := a.db.Conn().
		Table("visit").
		Select("id, visitor_id, property_unit_id, visit_status_id, visit_type_id, purpose, scheduled_date, actual_entry_time, actual_exit_time").
		Where("business_id = ?", businessID).
		Order("id DESC").
		Limit(20).
		Find(&models)

	if result.Error != nil {
		return nil, result.Error
	}

	visits := make([]domain.Visit, len(models))
	for i, m := range models {
		visits[i] = domain.Visit{
			ID:             m.ID,
			VisitorID:      m.VisitorID,
			PropertyUnitID: m.PropertyUnitID,
			VisitStatusID:  m.VisitStatusID,
			VisitTypeID:    m.VisitTypeID,
			Purpose:        m.Purpose,
			ScheduledDate:  m.ScheduledDate,
		}
	}

	return visits, nil
}

// GetVisitStatistics obtiene estadísticas de visitas
func (a *DatabaseAdapter) GetVisitStatistics(ctx context.Context, businessID uint) (*domain.VisitStatistics, error) {
	type StatsModel struct {
		TotalVisits     int64 `gorm:"column:total_visits"`
		PendingVisits   int64 `gorm:"column:pending_visits"`
		ActiveVisits    int64 `gorm:"column:active_visits"`
		CompletedVisits int64 `gorm:"column:completed_visits"`
		TodayVisits     int64 `gorm:"column:today_visits"`
	}

	var model StatsModel
	query := `
		SELECT
			COUNT(*) as total_visits,
			SUM(CASE WHEN visit_status_id = 1 THEN 1 ELSE 0 END) as pending_visits,
			SUM(CASE WHEN visit_status_id = 2 THEN 1 ELSE 0 END) as active_visits,
			SUM(CASE WHEN visit_status_id = 3 THEN 1 ELSE 0 END) as completed_visits,
			SUM(CASE WHEN scheduled_date::date = CURRENT_DATE THEN 1 ELSE 0 END) as today_visits
		FROM visit
		WHERE business_id = ?
	`

	result := a.db.Conn().Raw(query, businessID).Scan(&model)
	if result.Error != nil {
		return nil, result.Error
	}

	return &domain.VisitStatistics{
		TotalVisits:     model.TotalVisits,
		PendingVisits:   model.PendingVisits,
		ActiveVisits:    model.ActiveVisits,
		CompletedVisits: model.CompletedVisits,
		TodayVisits:     model.TodayVisits,
	}, nil
}

// ExecuteCustomQuery ejecuta una consulta personalizada
func (a *DatabaseAdapter) ExecuteCustomQuery(ctx context.Context, query string) ([]map[string]any, error) {
	// Validar que sea SELECT
	if !strings.HasPrefix(strings.ToUpper(strings.TrimSpace(query)), "SELECT") {
		return nil, domain.ErrInvalidVisitData
	}

	var results []map[string]any
	result := a.db.DebugConn().Raw(query).Scan(&results)

	if result.Error != nil {
		return nil, result.Error
	}

	return results, nil
}

// CheckConnection verifica la conexión a la BD
func (a *DatabaseAdapter) CheckConnection(ctx context.Context) (*domain.DBConnectionStats, error) {
	sqlDB, err := a.db.Conn().DB()
	if err != nil {
		return nil, err
	}

	if err := sqlDB.Ping(); err != nil {
		return nil, err
	}

	stats := sqlDB.Stats()

	return &domain.DBConnectionStats{
		OpenConnections: stats.OpenConnections,
		InUse:           stats.InUse,
		Idle:            stats.Idle,
		WaitCount:       stats.WaitCount,
	}, nil
}
