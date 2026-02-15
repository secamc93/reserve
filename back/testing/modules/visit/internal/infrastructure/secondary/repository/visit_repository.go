package repository

import (
	"context"
	"dbpostgres/app/infra/models"
	"reserve/testing/modules/visit/internal/domain"
	"reserve/testing/shared/db"
)

// VisitRepository implementa DatabasePort usando la conexión real a BD
type VisitRepository struct {
	db db.IDatabase
}

// New crea una nueva instancia de VisitRepository
func New(database db.IDatabase) *VisitRepository {
	return &VisitRepository{
		db: database,
	}
}

// ListVisitorsFromDB lista visitantes desde la BD
func (r *VisitRepository) ListVisitorsFromDB(ctx context.Context) ([]domain.Visitor, error) {
	var visitors []models.Visitor
	result := r.db.Conn(ctx).
		Select("id, dni, full_name, phone, email").
		Order("id DESC").
		Limit(20).
		Find(&visitors)

	if result.Error != nil {
		return nil, result.Error
	}

	domainVisitors := make([]domain.Visitor, len(visitors))
	for i, v := range visitors {
		domainVisitors[i] = domain.Visitor{
			ID:       v.ID,
			DNI:      v.DNI,
			FullName: v.FullName,
			Phone:    v.Phone,
			Email:    v.Email,
		}
	}

	return domainVisitors, nil
}

// VisitorExistsByDNI verifica si un visitante existe por DNI
func (r *VisitRepository) VisitorExistsByDNI(ctx context.Context, dni string) (bool, error) {
	var count int64
	result := r.db.Conn(ctx).
		Model(&models.Visitor{}).
		Where("dni = ?", dni).
		Count(&count)

	if result.Error != nil {
		return false, result.Error
	}

	return count > 0, nil
}

// GetRandomVisitor obtiene un visitante aleatorio de la BD
func (r *VisitRepository) GetRandomVisitor(ctx context.Context) (*domain.Visitor, error) {
	var visitor models.Visitor
	result := r.db.Conn(ctx).
		Select("id, dni, full_name, phone, email").
		Order("RANDOM()").
		First(&visitor)

	if result.Error != nil {
		return nil, result.Error
	}

	return &domain.Visitor{
		ID:       visitor.ID,
		DNI:      visitor.DNI,
		FullName: visitor.FullName,
		Phone:    visitor.Phone,
		Email:    visitor.Email,
	}, nil
}

// GetRandomVisit obtiene una visita aleatoria del negocio
func (r *VisitRepository) GetRandomVisit(ctx context.Context, businessID uint) (*domain.Visit, error) {
	var visit models.Visit
	result := r.db.Conn(ctx).
		Select("id, visitor_id, property_unit_id, visit_status_id, visit_type_id, purpose, qr_code").
		Where("business_id = ?", businessID).
		Order("RANDOM()").
		First(&visit)

	if result.Error != nil {
		return nil, result.Error
	}

	return &domain.Visit{
		ID:             visit.ID,
		VisitorID:      visit.VisitorID,
		PropertyUnitID: visit.PropertyUnitID,
		VisitStatusID:  visit.VisitStatusID,
		VisitTypeID:    visit.VisitTypeID,
		Purpose:        visit.Purpose,
		QRCode:         visit.QRCode,
	}, nil
}

// GetRandomPropertyUnit obtiene una unidad aleatoria del negocio
func (r *VisitRepository) GetRandomPropertyUnit(ctx context.Context, businessID uint) (*domain.PropertyUnit, error) {
	var unit models.PropertyUnit
	result := r.db.Conn(ctx).
		Select("id, number, block, unit_type, business_id").
		Where("business_id = ?", businessID).
		Order("RANDOM()").
		First(&unit)

	if result.Error != nil {
		return nil, result.Error
	}

	return &domain.PropertyUnit{
		ID:         unit.ID,
		Identifier: unit.Number,
		Block:      unit.Block,
		UnitType:   unit.UnitType,
		BusinessID: unit.BusinessID,
	}, nil
}

// GetRandomVisitType obtiene un tipo de visita aleatorio
func (r *VisitRepository) GetRandomVisitType(ctx context.Context) (*domain.VisitType, error) {
	var visitType models.VisitType
	result := r.db.Conn(ctx).
		Select("id, name").
		Order("RANDOM()").
		First(&visitType)

	if result.Error != nil {
		return nil, result.Error
	}

	return &domain.VisitType{
		ID:   visitType.ID,
		Name: visitType.Name,
	}, nil
}

// GetVisitWithCompanions obtiene una visita que tenga acompañantes
func (r *VisitRepository) GetVisitWithCompanions(ctx context.Context, businessID uint) (*domain.Visit, error) {
	var visit models.Visit
	result := r.db.Conn(ctx).
		Select("v.id, v.visitor_id, v.property_unit_id, v.visit_status_id, v.visit_type_id, v.purpose, v.qr_code").
		Table("visit v").
		Joins("INNER JOIN visit_companion vc ON vc.visit_id = v.id").
		Where("v.business_id = ?", businessID).
		Order("RANDOM()").
		First(&visit)

	if result.Error != nil {
		return nil, result.Error
	}

	return &domain.Visit{
		ID:             visit.ID,
		VisitorID:      visit.VisitorID,
		PropertyUnitID: visit.PropertyUnitID,
		VisitStatusID:  visit.VisitStatusID,
		VisitTypeID:    visit.VisitTypeID,
		Purpose:        visit.Purpose,
		QRCode:         visit.QRCode,
	}, nil
}

// CountVisitors cuenta el total de visitantes
func (r *VisitRepository) CountVisitors(ctx context.Context) (int64, error) {
	var count int64
	result := r.db.Conn(ctx).
		Model(&models.Visitor{}).
		Count(&count)

	return count, result.Error
}

// CountVisits cuenta el total de visitas del negocio
func (r *VisitRepository) CountVisits(ctx context.Context, businessID uint) (int64, error) {
	var count int64
	result := r.db.Conn(ctx).
		Model(&models.Visit{}).
		Where("business_id = ?", businessID).
		Count(&count)

	return count, result.Error
}

// ListVisitsFromDB lista visitas desde la BD
func (r *VisitRepository) ListVisitsFromDB(ctx context.Context, businessID uint) ([]domain.Visit, error) {
	var visits []models.Visit
	result := r.db.Conn(ctx).
		Select("id, visitor_id, property_unit_id, visit_status_id, visit_type_id, purpose, scheduled_date, actual_entry_time, actual_exit_time").
		Where("business_id = ?", businessID).
		Order("id DESC").
		Limit(20).
		Find(&visits)

	if result.Error != nil {
		return nil, result.Error
	}

	domainVisits := make([]domain.Visit, len(visits))
	for i, v := range visits {
		scheduledDate := ""
		if !v.ScheduledDate.IsZero() {
			scheduledDate = v.ScheduledDate.Format("2006-01-02")
		}

		domainVisits[i] = domain.Visit{
			ID:             v.ID,
			VisitorID:      v.VisitorID,
			PropertyUnitID: v.PropertyUnitID,
			VisitStatusID:  v.VisitStatusID,
			VisitTypeID:    v.VisitTypeID,
			Purpose:        v.Purpose,
			ScheduledDate:  scheduledDate,
		}
	}

	return domainVisits, nil
}

// ListPropertyUnitsFromDB lista property units desde la BD
func (r *VisitRepository) ListPropertyUnitsFromDB(ctx context.Context, businessID uint) ([]domain.PropertyUnit, error) {
	var units []models.PropertyUnit
	result := r.db.Conn(ctx).
		Select("id, number, block, unit_type, business_id").
		Where("business_id = ?", businessID).
		Order("number ASC").
		Limit(50).
		Find(&units)

	if result.Error != nil {
		return nil, result.Error
	}

	domainUnits := make([]domain.PropertyUnit, len(units))
	for i, u := range units {
		domainUnits[i] = domain.PropertyUnit{
			ID:         u.ID,
			Identifier: u.Number,
			Block:      u.Block,
			UnitType:   u.UnitType,
			BusinessID: u.BusinessID,
		}
	}

	return domainUnits, nil
}

// ListVisitTypesFromDB lista tipos de visita desde la BD
func (r *VisitRepository) ListVisitTypesFromDB(ctx context.Context) ([]domain.VisitType, error) {
	var types []models.VisitType
	result := r.db.Conn(ctx).
		Select("id, name").
		Order("id ASC").
		Find(&types)

	if result.Error != nil {
		return nil, result.Error
	}

	domainTypes := make([]domain.VisitType, len(types))
	for i, t := range types {
		domainTypes[i] = domain.VisitType{
			ID:   t.ID,
			Name: t.Name,
		}
	}

	return domainTypes, nil
}

// GetVisitStatistics obtiene estadísticas de visitas usando GORM
func (r *VisitRepository) GetVisitStatistics(ctx context.Context, businessID uint) (*domain.VisitStatistics, error) {
	var totalVisits int64
	var pendingVisits int64
	var activeVisits int64
	var completedVisits int64
	var todayVisits int64

	db := r.db.Conn(ctx).Model(&models.Visit{}).Where("business_id = ?", businessID)

	// Total
	if err := db.Count(&totalVisits).Error; err != nil {
		return nil, err
	}

	// Pending (status_id = 1)
	if err := r.db.Conn(ctx).Model(&models.Visit{}).
		Where("business_id = ? AND visit_status_id = ?", businessID, 1).
		Count(&pendingVisits).Error; err != nil {
		return nil, err
	}

	// Active (status_id = 2)
	if err := r.db.Conn(ctx).Model(&models.Visit{}).
		Where("business_id = ? AND visit_status_id = ?", businessID, 2).
		Count(&activeVisits).Error; err != nil {
		return nil, err
	}

	// Completed (status_id = 3)
	if err := r.db.Conn(ctx).Model(&models.Visit{}).
		Where("business_id = ? AND visit_status_id = ?", businessID, 3).
		Count(&completedVisits).Error; err != nil {
		return nil, err
	}

	// Today
	if err := r.db.Conn(ctx).Model(&models.Visit{}).
		Where("business_id = ? AND DATE(scheduled_date) = CURRENT_DATE", businessID).
		Count(&todayVisits).Error; err != nil {
		return nil, err
	}

	return &domain.VisitStatistics{
		TotalVisits:     totalVisits,
		PendingVisits:   pendingVisits,
		ActiveVisits:    activeVisits,
		CompletedVisits: completedVisits,
		TodayVisits:     todayVisits,
	}, nil
}

// CheckConnection verifica la conexión a la BD
func (r *VisitRepository) CheckConnection(ctx context.Context) (*domain.DBConnectionStats, error) {
	sqlDB, err := r.db.Conn(ctx).DB()
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
