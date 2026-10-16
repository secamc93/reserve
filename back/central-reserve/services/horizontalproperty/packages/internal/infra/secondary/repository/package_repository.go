package repository

import (
	"context"
	"fmt"
	"math"
	"strings"
	"time"

	"central_reserve/services/horizontalproperty/packages/internal/domain"
	"central_reserve/services/horizontalproperty/packages/internal/infra/secondary/repository/mappers"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type PackageRepository struct {
	db     db.IDatabase
	logger log.ILogger
}

func NewPackageRepository(db db.IDatabase, logger log.ILogger) domain.PackageRepository {
	return &PackageRepository{
		db:     db,
		logger: logger,
	}
}

// CreatePackage crea un nuevo paquete
func (r *PackageRepository) CreatePackage(ctx context.Context, pkg *domain.Package) (*domain.Package, error) {
	model := &models.Package{
		BusinessID:         pkg.BusinessID,
		PropertyUnitID:     pkg.PropertyUnitID,
		ResidentID:         pkg.ResidentID,
		PackageStatusID:    pkg.PackageStatusID,
		Carrier:            pkg.Carrier,
		TrackingNumber:     pkg.TrackingNumber,
		QRCode:             pkg.QRCode,
		ReceivedByUserID:   pkg.ReceivedByUserID,
		ReceivedAt:         pkg.ReceivedAt,
		DeliveredByUserID:  pkg.DeliveredByUserID,
		DeliveredAt:        pkg.DeliveredAt,
		Description:        pkg.Description,
		Notes:              pkg.Notes,
		NotifyResident:     pkg.NotifyResident,
		NotificationSentAt: pkg.NotificationSentAt,
	}

	if err := r.db.Conn(ctx).Create(model).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error creando paquete")
		return nil, fmt.Errorf("error creando paquete: %w", err)
	}

	// Cargar relaciones para mapear correctamente
	if err := r.db.Conn(ctx).
		Preload("PropertyUnit").
		Preload("Resident").
		Preload("PackageStatus").
		Preload("ReceivedByUser").
		Preload("DeliveredByUser").
		First(model, model.ID).Error; err != nil {
		return nil, fmt.Errorf("error cargando relaciones de paquete: %w", err)
	}

	return mappers.PackageToDomain(model), nil
}

// GetPackageByID obtiene un paquete por ID
func (r *PackageRepository) GetPackageByID(ctx context.Context, id uint) (*domain.Package, error) {
	var pkg models.Package
	if err := r.db.Conn(ctx).
		Preload("PropertyUnit").
		Preload("Resident").
		Preload("PackageStatus").
		Preload("ReceivedByUser").
		Preload("DeliveredByUser").
		First(&pkg, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrPackageNotFound
		}
		return nil, fmt.Errorf("error obteniendo paquete: %w", err)
	}

	return mappers.PackageToDomain(&pkg), nil
}

// GetPackageByQRCode obtiene un paquete por código QR
func (r *PackageRepository) GetPackageByQRCode(ctx context.Context, qrCode string) (*domain.Package, error) {
	var pkg models.Package
	if err := r.db.Conn(ctx).
		Preload("PropertyUnit").
		Preload("Resident").
		Preload("PackageStatus").
		Preload("ReceivedByUser").
		Preload("DeliveredByUser").
		Where("qr_code = ?", qrCode).
		First(&pkg).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrPackageNotFound
		}
		return nil, fmt.Errorf("error obteniendo paquete por QR: %w", err)
	}

	return mappers.PackageToDomain(&pkg), nil
}

// UpdatePackage actualiza un paquete
func (r *PackageRepository) UpdatePackage(ctx context.Context, pkg *domain.Package) error {
	updates := map[string]interface{}{
		"package_status_id":    pkg.PackageStatusID,
		"delivered_by_user_id": pkg.DeliveredByUserID,
		"delivered_at":         pkg.DeliveredAt,
		"notes":                pkg.Notes,
	}

	if pkg.Description != "" {
		updates["description"] = pkg.Description
	}
	if pkg.NotificationSentAt != nil {
		updates["notification_sent_at"] = pkg.NotificationSentAt
	}

	if err := r.db.Conn(ctx).Model(&models.Package{}).Where("id = ?", pkg.ID).Updates(updates).Error; err != nil {
		return fmt.Errorf("error actualizando paquete: %w", err)
	}

	return nil
}

// ListPackages lista paquetes con filtros y paginación.
//
// Orden: primero los por entregar (received, in_storage, notified), del más antiguo al más
// reciente (la portería entrega primero lo que lleva más tiempo); después los demás, del más
// reciente al más antiguo.
func (r *PackageRepository) ListPackages(ctx context.Context, filters domain.PackageFiltersDTO) (*domain.PaginatedPackagesDTO, error) {
	base := func() *gorm.DB {
		q := r.db.Conn(ctx).Model(&models.Package{}).
			Joins("JOIN horizontal_property.property_units ON property_units.id = packages.property_unit_id").
			Joins("LEFT JOIN horizontal_property.residents ON residents.id = packages.resident_id").
			Joins("JOIN horizontal_property.package_statuses ON package_statuses.id = packages.package_status_id")
		return applyPackageFilters(q, filters)
	}

	var total int64
	if err := base().Count(&total).Error; err != nil {
		return nil, fmt.Errorf("error contando paquetes: %w", err)
	}

	type row struct {
		ID                 uint
		TrackingNumber     string
		Carrier            string
		PropertyUnitNumber string
		PropertyUnitBlock  string
		ResidentName       string
		StatusName         string
		StatusCode         string
		Description        string
		ReceivedAt         *time.Time
		DeliveredAt        *time.Time
		CreatedAt          time.Time
	}

	pendingCodes := domain.PackageStatusGroups[domain.PackageGroupPending]
	rows := []row{}
	offset := (filters.Page - 1) * filters.PageSize
	if err := base().
		Select("packages.id, packages.tracking_number, packages.carrier, property_units.number as property_unit_number, " +
			"COALESCE(property_units.block, '') as property_unit_block, " +
			"COALESCE(residents.name, '') as resident_name, package_statuses.name as status_name, package_statuses.code as status_code, " +
			"COALESCE(packages.description, '') as description, packages.received_at, packages.delivered_at, packages.created_at").
		Order(clause.OrderBy{Expression: clause.Expr{
			SQL:                "CASE WHEN package_statuses.code IN (?) THEN 0 ELSE 1 END, CASE WHEN package_statuses.code IN (?) THEN COALESCE(packages.received_at, packages.created_at) END ASC, packages.created_at DESC, packages.id DESC",
			Vars:               []interface{}{pendingCodes, pendingCodes},
			WithoutParentheses: true,
		}}).
		Limit(filters.PageSize).
		Offset(offset).
		Scan(&rows).Error; err != nil {
		return nil, fmt.Errorf("error listando paquetes: %w", err)
	}

	packages := make([]domain.PackageListDTO, len(rows))
	for i, rw := range rows {
		packages[i] = domain.PackageListDTO{
			ID:                 rw.ID,
			TrackingNumber:     rw.TrackingNumber,
			Carrier:            rw.Carrier,
			PropertyUnitNumber: rw.PropertyUnitNumber,
			PropertyUnitBlock:  rw.PropertyUnitBlock,
			ResidentName:       rw.ResidentName,
			StatusName:         rw.StatusName,
			StatusCode:         rw.StatusCode,
			Description:        rw.Description,
			ReceivedAt:         rw.ReceivedAt,
			DeliveredAt:        rw.DeliveredAt,
			CreatedAt:          rw.CreatedAt,
		}
	}

	return &domain.PaginatedPackagesDTO{
		Packages:   packages,
		Total:      total,
		Page:       filters.Page,
		PageSize:   filters.PageSize,
		TotalPages: int(math.Ceil(float64(total) / float64(filters.PageSize))),
	}, nil
}

// applyPackageFilters aplica los filtros de la lista (la consulta ya une property_units,
// residents y package_statuses).
func applyPackageFilters(q *gorm.DB, filters domain.PackageFiltersDTO) *gorm.DB {
	// business_id 0 = super admin sin negocio elegido: todos
	if filters.BusinessID != 0 {
		q = q.Where("packages.business_id = ?", filters.BusinessID)
	}
	if filters.PropertyUnitID != nil {
		q = q.Where("packages.property_unit_id = ?", *filters.PropertyUnitID)
	}
	if filters.ResidentID != nil {
		q = q.Where("packages.resident_id = ?", *filters.ResidentID)
	}
	if filters.PackageStatusID != nil {
		q = q.Where("packages.package_status_id = ?", *filters.PackageStatusID)
	}
	if codes, ok := domain.PackageStatusGroups[filters.StatusGroup]; ok {
		q = q.Where("package_statuses.code IN ?", codes)
	}
	if filters.DeliveredSince != nil {
		q = q.Where("packages.delivered_at >= ?", *filters.DeliveredSince)
	}
	if filters.StartDate != nil {
		q = q.Where("packages.created_at >= ?", *filters.StartDate)
	}
	if filters.EndDate != nil {
		q = q.Where("packages.created_at <= ?", *filters.EndDate)
	}
	if filters.Search != "" {
		like := "%" + strings.ToLower(filters.Search) + "%"
		q = q.Where("(LOWER(packages.tracking_number) LIKE ? OR LOWER(packages.carrier) LIKE ? OR LOWER(property_units.number) LIKE ? "+
			"OR LOWER(COALESCE(property_units.block, '') || ' ' || property_units.number) LIKE ? OR LOWER(COALESCE(residents.name, '')) LIKE ?)",
			like, like, like, like, like)
	}
	return q
}

// CountPackagesByStatusCodes cuenta paquetes del negocio con esos estados.
func (r *PackageRepository) CountPackagesByStatusCodes(ctx context.Context, businessID uint, codes []string, receivedBefore *time.Time, deliveredSince *time.Time) (int64, error) {
	q := r.db.Conn(ctx).Model(&models.Package{}).
		Joins("JOIN horizontal_property.package_statuses ON package_statuses.id = packages.package_status_id").
		Where("package_statuses.code IN ?", codes)
	if businessID != 0 {
		q = q.Where("packages.business_id = ?", businessID)
	}
	if receivedBefore != nil {
		q = q.Where("COALESCE(packages.received_at, packages.created_at) < ?", *receivedBefore)
	}
	if deliveredSince != nil {
		q = q.Where("packages.delivered_at >= ?", *deliveredSince)
	}
	var total int64
	if err := q.Count(&total).Error; err != nil {
		return 0, fmt.Errorf("error contando paquetes: %w", err)
	}
	return total, nil
}

// GetPackageStatusByCode obtiene un estado de paquete por código
func (r *PackageRepository) GetPackageStatusByCode(ctx context.Context, code string) (*domain.PackageStatus, error) {
	var status models.PackageStatus
	if err := r.db.Conn(ctx).Where("code = ? AND is_active = ?", code, true).First(&status).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo estado de paquete: %w", err)
	}

	return &domain.PackageStatus{
		ID:          status.ID,
		Code:        status.Code,
		Name:        status.Name,
		Description: status.Description,
		IsFinal:     status.IsFinal,
		IsActive:    status.IsActive,
	}, nil
}

// GetPackageStatuses obtiene todos los estados de paquete activos
func (r *PackageRepository) GetPackageStatuses(ctx context.Context) ([]*domain.PackageStatus, error) {
	var statuses []models.PackageStatus
	if err := r.db.Conn(ctx).Where("is_active = ?", true).Order("id ASC").Find(&statuses).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo estados de paquete: %w", err)
	}

	result := make([]*domain.PackageStatus, len(statuses))
	for i, s := range statuses {
		result[i] = &domain.PackageStatus{
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

// GetPropertyUnitBusinessID obtiene el business_id de una property_unit
func (r *PackageRepository) GetPropertyUnitBusinessID(ctx context.Context, propertyUnitID uint) (uint, error) {
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
