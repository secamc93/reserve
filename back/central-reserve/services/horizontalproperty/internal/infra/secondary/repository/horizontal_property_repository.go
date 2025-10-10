package repository

import (
	"context"
	"dbpostgres/app/infra/models"
	"fmt"
	"math"
	"strings"
	"time"

	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/services/horizontalproperty/internal/infra/secondary/repository/mapper"
	"central_reserve/shared/db"
	"central_reserve/shared/log"

	"gorm.io/gorm"
)

// horizontalPropertyRepository implementa el repositorio de propiedades horizontales
type Repository struct {
	db     db.IDatabase
	logger log.ILogger
}

// NewHorizontalPropertyRepository crea una nueva instancia del repositorio
func New(db db.IDatabase, logger log.ILogger) domain.HorizontalPropertyRepository {
	return &Repository{
		db:     db,
		logger: logger,
	}
}

// CreateHorizontalProperty crea una nueva propiedad horizontal
func (r *Repository) CreateHorizontalProperty(ctx context.Context, property *domain.HorizontalProperty) (*domain.HorizontalProperty, error) {
	// Mapear a modelo de GORM (Business)
	businessModel := mapper.ToBusinessModel(property)

	// Crear en la base de datos
	if err := r.db.Conn(ctx).Create(businessModel).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error creando propiedad horizontal en la base de datos")
		return nil, fmt.Errorf("error creando propiedad horizontal: %w", err)
	}

	// Mapear de vuelta a entidad de dominio
	return mapper.ToDomainEntity(businessModel), nil
}

// GetByID obtiene una propiedad horizontal por ID con información detallada
func (r *Repository) GetHorizontalPropertyByID(ctx context.Context, id uint) (*domain.HorizontalProperty, error) {
	var business models.Business

	// Primero obtener el BusinessType de propiedad horizontal
	var businessType models.BusinessType
	err := r.db.Conn(ctx).Where("code = ?", "horizontal_property").First(&businessType).Error
	if err != nil {
		r.logger.Error().Err(err).Msg("Error obteniendo tipo de negocio horizontal_property")
		return nil, fmt.Errorf("tipo de negocio horizontal_property no encontrado: %w", err)
	}

	// Buscar el business con información detallada (unidades y comités)
	err = r.db.Conn(ctx).
		Preload("BusinessType").
		Preload("PropertyUnits", "is_active = ?", true). // Solo unidades activas
		Preload("Committees.CommitteeType").             // Comités con su tipo
		Where("id = ? AND business_type_id = ?", id, businessType.ID).
		First(&business).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("propiedad horizontal no encontrada")
		}
		r.logger.Error().Err(err).Uint("id", id).Msg("Error obteniendo propiedad horizontal por ID")
		return nil, fmt.Errorf("error obteniendo propiedad horizontal: %w", err)
	}

	return mapper.ToDomainEntityWithDetails(&business), nil
}

// UpdateHorizontalProperty actualiza una propiedad horizontal
func (r *Repository) UpdateHorizontalProperty(ctx context.Context, id uint, property *domain.HorizontalProperty) (*domain.HorizontalProperty, error) {
	businessModel := mapper.ToBusinessModel(property)
	businessModel.ID = id

	// Actualizar en la base de datos
	if err := r.db.Conn(ctx).Save(businessModel).Error; err != nil {
		r.logger.Error().Err(err).Uint("id", id).Msg("Error actualizando propiedad horizontal")
		return nil, fmt.Errorf("error actualizando propiedad horizontal: %w", err)
	}

	// Obtener el registro actualizado con relaciones
	var updatedBusiness models.Business
	if err := r.db.Conn(ctx).Preload("BusinessType").First(&updatedBusiness, id).Error; err != nil {
		r.logger.Error().Err(err).Uint("id", id).Msg("Error obteniendo propiedad horizontal actualizada")
		return nil, fmt.Errorf("error obteniendo propiedad horizontal actualizada: %w", err)
	}

	return mapper.ToDomainEntity(&updatedBusiness), nil
}

// DeleteHorizontalProperty elimina una propiedad horizontal
func (r *Repository) DeleteHorizontalProperty(ctx context.Context, id uint) error {
	result := r.db.Conn(ctx).Delete(&models.Business{}, id)

	if result.Error != nil {
		r.logger.Error().Err(result.Error).Uint("id", id).Msg("Error eliminando propiedad horizontal")
		return fmt.Errorf("error eliminando propiedad horizontal: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("propiedad horizontal no encontrada")
	}

	return nil
}

// ListHorizontalProperties obtiene una lista paginada de propiedades horizontales
func (r *Repository) ListHorizontalProperties(ctx context.Context, filters domain.HorizontalPropertyFiltersDTO) (*domain.PaginatedHorizontalPropertyDTO, error) {
	var businesses []models.Business
	var total int64

	// Primero obtener el BusinessType de propiedad horizontal
	var businessType models.BusinessType
	err := r.db.Conn(ctx).Where("code = ?", "horizontal_property").First(&businessType).Error
	if err != nil {
		r.logger.Error().Err(err).Msg("Error obteniendo tipo de negocio horizontal_property")
		return nil, fmt.Errorf("tipo de negocio horizontal_property no encontrado: %w", err)
	}

	// Construir query base con el ID específico del tipo de negocio
	query := r.db.Conn(ctx).
		Model(&models.Business{}).
		Preload("BusinessType").
		Where("business_type_id = ?", businessType.ID)

	// Aplicar filtros
	if filters.Name != nil && strings.TrimSpace(*filters.Name) != "" {
		query = query.Where("name ILIKE ?", "%"+*filters.Name+"%")
	}
	if filters.Code != nil && strings.TrimSpace(*filters.Code) != "" {
		query = query.Where("code ILIKE ?", "%"+*filters.Code+"%")
	}
	if filters.IsActive != nil {
		query = query.Where("is_active = ?", *filters.IsActive)
	}

	// Contar total
	if err := query.Count(&total).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error contando propiedades horizontales")
		return nil, fmt.Errorf("error contando propiedades horizontales: %w", err)
	}

	// Aplicar ordenamiento
	orderClause := fmt.Sprintf("%s %s", filters.OrderBy, strings.ToUpper(filters.OrderDir))
	query = query.Order(orderClause)

	// Aplicar paginación
	offset := (filters.Page - 1) * filters.PageSize
	query = query.Offset(offset).Limit(filters.PageSize)

	// Ejecutar query
	if err := query.Find(&businesses).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error obteniendo lista de propiedades horizontales")
		return nil, fmt.Errorf("error obteniendo lista de propiedades horizontales: %w", err)
	}

	// Mapear a DTOs de lista usando el mapper
	data := mapper.ToHorizontalPropertyListDTOs(businesses)

	// Calcular páginas totales
	totalPages := int(math.Ceil(float64(total) / float64(filters.PageSize)))

	return &domain.PaginatedHorizontalPropertyDTO{
		Data:       data,
		Total:      total,
		Page:       filters.Page,
		PageSize:   filters.PageSize,
		TotalPages: totalPages,
	}, nil
}

// ExistsHorizontalPropertyByCode verifica si existe una propiedad horizontal con el código dado
func (r *Repository) ExistsHorizontalPropertyByCode(ctx context.Context, code string, excludeID *uint) (bool, error) {
	var count int64

	// Primero obtener el BusinessType de propiedad horizontal
	var businessType models.BusinessType
	err := r.db.Conn(ctx).Where("code = ?", "horizontal_property").First(&businessType).Error
	if err != nil {
		r.logger.Error().Err(err).Msg("Error obteniendo tipo de negocio horizontal_property")
		return false, fmt.Errorf("tipo de negocio horizontal_property no encontrado: %w", err)
	}

	query := r.db.Conn(ctx).
		Model(&models.Business{}).
		Where("code = ? AND business_type_id = ?", code, businessType.ID)

	if excludeID != nil {
		query = query.Where("id != ?", *excludeID)
	}

	if err := query.Count(&count).Error; err != nil {
		r.logger.Error().Err(err).Str("code", code).Msg("Error verificando existencia de código")
		return false, fmt.Errorf("error verificando existencia de código: %w", err)
	}

	return count > 0, nil
}

// ExistsCustomDomain verifica si existe un custom_domain en uso
func (r *Repository) ExistsCustomDomain(ctx context.Context, customDomain string, excludeID *uint) (bool, error) {
	// Si el custom_domain está vacío, validar que no haya otros vacíos
	// porque el constraint único no permite múltiples strings vacíos
	trimmed := strings.TrimSpace(customDomain)

	var count int64
	var query *gorm.DB

	if trimmed == "" {
		// Buscar otros custom_domain vacíos
		query = r.db.Conn(ctx).Model(&models.Business{}).Where("custom_domain = ''")
	} else {
		// Buscar el custom_domain específico
		query = r.db.Conn(ctx).Model(&models.Business{}).Where("custom_domain = ?", customDomain)
	}

	if excludeID != nil {
		query = query.Where("id != ?", *excludeID)
	}

	if err := query.Count(&count).Error; err != nil {
		r.logger.Error().Err(err).Str("custom_domain", customDomain).Msg("Error verificando existencia de dominio personalizado")
		return false, fmt.Errorf("error verificando existencia de dominio personalizado: %w", err)
	}

	return count > 0, nil
}

// ParentBusinessExists verifica si existe un business padre
func (r *Repository) ParentBusinessExists(ctx context.Context, parentBusinessID uint) (bool, error) {
	var count int64

	if err := r.db.Conn(ctx).Model(&models.Business{}).Where("id = ?", parentBusinessID).Count(&count).Error; err != nil {
		r.logger.Error().Err(err).Uint("parent_business_id", parentBusinessID).Msg("Error verificando existencia de negocio padre")
		return false, fmt.Errorf("error verificando existencia de negocio padre: %w", err)
	}

	return count > 0, nil
}

// ═══════════════════════════════════════════════════════════════════
//
//	MÉTODOS PARA CONFIGURACIÓN INICIAL (SETUP)
//
// ═══════════════════════════════════════════════════════════════════

// CreatePropertyUnits crea múltiples unidades de propiedad en bulk
func (r *Repository) CreatePropertyUnits(ctx context.Context, businessID uint, units []domain.PropertyUnitCreate) error {
	if len(units) == 0 {
		return nil
	}

	// Convertir a modelos de GORM usando mapper
	propertyUnits := mapper.ToPropertyUnitModels(businessID, units)

	// Crear en batch
	if err := r.db.Conn(ctx).CreateInBatches(&propertyUnits, 100).Error; err != nil {
		r.logger.Error().Err(err).Uint("business_id", businessID).Int("units_count", len(units)).Msg("Error creando unidades de propiedad")
		return fmt.Errorf("error creando unidades de propiedad: %w", err)
	}

	r.logger.Info().Uint("business_id", businessID).Int("units_created", len(units)).Msg("Unidades de propiedad creadas exitosamente")
	return nil
}

// GetRequiredCommitteeTypes obtiene los tipos de comités requeridos por ley
func (r *Repository) GetRequiredCommitteeTypes(ctx context.Context) ([]domain.CommitteeTypeInfo, error) {
	var committeeTypes []models.CommitteeType

	// Buscar comités requeridos y activos
	err := r.db.Conn(ctx).
		Where("is_required = ? AND is_active = ?", true, true).
		Find(&committeeTypes).Error

	if err != nil {
		r.logger.Error().Err(err).Msg("Error obteniendo tipos de comités requeridos")
		return nil, fmt.Errorf("error obteniendo tipos de comités requeridos: %w", err)
	}

	// Mapear a DTOs usando mapper
	return mapper.ToCommitteeTypeInfo(committeeTypes), nil
}

// CreateRequiredCommittees crea los comités requeridos por ley para una propiedad
func (r *Repository) CreateRequiredCommittees(ctx context.Context, businessID uint) error {
	// Obtener tipos de comités requeridos
	committeeTypes, err := r.GetRequiredCommitteeTypes(ctx)
	if err != nil {
		return err
	}

	if len(committeeTypes) == 0 {
		r.logger.Warn().Msg("No se encontraron tipos de comités requeridos")
		return nil
	}

	// Crear comités para esta propiedad
	committees := make([]models.Committee, len(committeeTypes))
	now := time.Now()

	for i, ct := range committeeTypes {
		// Calcular fecha de fin basado en duración del término
		var endDate *time.Time
		if ct.TermDurationMonths != nil && *ct.TermDurationMonths > 0 {
			end := now.AddDate(0, *ct.TermDurationMonths, 0)
			endDate = &end
		}

		committees[i] = models.Committee{
			BusinessID:      businessID,
			CommitteeTypeID: ct.ID,
			Name:            fmt.Sprintf("%s %d", ct.Name, now.Year()),
			StartDate:       now,
			EndDate:         endDate,
			IsActive:        true,
			Notes:           "Comité creado automáticamente durante la configuración inicial de la propiedad",
		}
	}

	// Crear en batch
	if err := r.db.Conn(ctx).Create(&committees).Error; err != nil {
		r.logger.Error().Err(err).Uint("business_id", businessID).Msg("Error creando comités requeridos")
		return fmt.Errorf("error creando comités requeridos: %w", err)
	}

	r.logger.Info().Uint("business_id", businessID).Int("committees_created", len(committees)).Msg("Comités requeridos creados exitosamente")
	return nil
}
