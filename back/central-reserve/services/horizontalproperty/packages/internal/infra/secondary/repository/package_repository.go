package repository

import (
	"context"
	"fmt"
	"math"
	"time"

	"central_reserve/services/horizontalproperty/packages/internal/domain"
	"central_reserve/services/horizontalproperty/packages/internal/infra/secondary/repository/mappers"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
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

// ListPackages lista paquetes con filtros y paginación
func (r *PackageRepository) ListPackages(ctx context.Context, filters domain.PackageFiltersDTO) (*domain.PaginatedPackagesDTO, error) {
	// Conteo total
	var total int64
	countQuery := r.db.Conn(ctx).Model(&models.Package{})

	// Aplicar filtro de business_id solo si no es 0 (super admin)
	if filters.BusinessID != 0 {
		countQuery = countQuery.Where("business_id = ?", filters.BusinessID)
	}

	if filters.PropertyUnitID != nil {
		countQuery = countQuery.Where("property_unit_id = ?", *filters.PropertyUnitID)
	}
	if filters.ResidentID != nil {
		countQuery = countQuery.Where("resident_id = ?", *filters.ResidentID)
	}
	if filters.PackageStatusID != nil {
		countQuery = countQuery.Where("package_status_id = ?", *filters.PackageStatusID)
	}
	if filters.StartDate != nil {
		countQuery = countQuery.Where("created_at >= ?", *filters.StartDate)
	}
	if filters.EndDate != nil {
		countQuery = countQuery.Where("created_at <= ?", *filters.EndDate)
	}

	if err := countQuery.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("error contando paquetes: %w", err)
	}

	// Consulta paginada
	type row struct {
		ID                 uint
		TrackingNumber     string
		Carrier            string
		PropertyUnitNumber string
		ResidentName       string
		StatusName         string
		StatusCode         string
		ReceivedAt         *time.Time
		DeliveredAt        *time.Time
		CreatedAt          time.Time
	}

	rows := []row{}
	query := r.db.Conn(ctx).Table("horizontal_property.packages p").
		Select("p.id, p.tracking_number, p.carrier, pu.number as property_unit_number, "+
			"COALESCE(r.name, '') as resident_name, ps.name as status_name, ps.code as status_code, "+
			"p.received_at, p.delivered_at, p.created_at").
		Joins("JOIN horizontal_property.property_units pu ON pu.id = p.property_unit_id").
		Joins("LEFT JOIN horizontal_property.residents r ON r.id = p.resident_id").
		Joins("JOIN horizontal_property.package_statuses ps ON ps.id = p.package_status_id")

	// Aplicar filtro de business_id solo si no es 0 (super admin)
	if filters.BusinessID != 0 {
		query = query.Where("p.business_id = ?", filters.BusinessID)
	}

	if filters.PropertyUnitID != nil {
		query = query.Where("p.property_unit_id = ?", *filters.PropertyUnitID)
	}
	if filters.ResidentID != nil {
		query = query.Where("p.resident_id = ?", *filters.ResidentID)
	}
	if filters.PackageStatusID != nil {
		query = query.Where("p.package_status_id = ?", *filters.PackageStatusID)
	}
	if filters.StartDate != nil {
		query = query.Where("p.created_at >= ?", *filters.StartDate)
	}
	if filters.EndDate != nil {
		query = query.Where("p.created_at <= ?", *filters.EndDate)
	}

	offset := (filters.Page - 1) * filters.PageSize
	if err := query.Order("p.created_at DESC").
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
			ResidentName:       rw.ResidentName,
			StatusName:         rw.StatusName,
			StatusCode:         rw.StatusCode,
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
