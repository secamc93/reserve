package repository

import (
	"context"
	"dbpostgres/app/infra/models"
	"fmt"
	"math"
	"strings"

	"central_reserve/services/horizontalproperty/internal/domain"
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
	businessModel := r.mapToBusinessModel(property)

	// Crear en la base de datos
	if err := r.db.Conn(ctx).Create(businessModel).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error creando propiedad horizontal en la base de datos")
		return nil, fmt.Errorf("error creando propiedad horizontal: %w", err)
	}

	// Mapear de vuelta a entidad de dominio
	return r.mapToEntity(businessModel), nil
}

// GetByID obtiene una propiedad horizontal por ID
func (r *Repository) GetHorizontalPropertyByID(ctx context.Context, id uint) (*domain.HorizontalProperty, error) {
	var business models.Business

	// Primero obtener el BusinessType de propiedad horizontal
	var businessType models.BusinessType
	err := r.db.Conn(ctx).Where("code = ?", "horizontal_property").First(&businessType).Error
	if err != nil {
		r.logger.Error().Err(err).Msg("Error obteniendo tipo de negocio horizontal_property")
		return nil, fmt.Errorf("tipo de negocio horizontal_property no encontrado: %w", err)
	}

	// Ahora buscar el business con ese tipo específico
	err = r.db.Conn(ctx).
		Preload("BusinessType").
		Where("id = ? AND business_type_id = ?", id, businessType.ID).
		First(&business).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("propiedad horizontal no encontrada")
		}
		r.logger.Error().Err(err).Uint("id", id).Msg("Error obteniendo propiedad horizontal por ID")
		return nil, fmt.Errorf("error obteniendo propiedad horizontal: %w", err)
	}

	return r.mapToEntity(&business), nil
}

// GetHorizontalPropertyByCode obtiene una propiedad horizontal por código
func (r *Repository) GetHorizontalPropertyByCode(ctx context.Context, code string) (*domain.HorizontalProperty, error) {
	var business models.Business

	// Primero obtener el BusinessType de propiedad horizontal
	var businessType models.BusinessType
	err := r.db.Conn(ctx).Where("code = ?", "horizontal_property").First(&businessType).Error
	if err != nil {
		r.logger.Error().Err(err).Msg("Error obteniendo tipo de negocio horizontal_property")
		return nil, fmt.Errorf("tipo de negocio horizontal_property no encontrado: %w", err)
	}

	// Ahora buscar el business con ese tipo específico
	err = r.db.Conn(ctx).
		Preload("BusinessType").
		Where("code = ? AND business_type_id = ?", code, businessType.ID).
		First(&business).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("propiedad horizontal no encontrada")
		}
		r.logger.Error().Err(err).Str("code", code).Msg("Error obteniendo propiedad horizontal por código")
		return nil, fmt.Errorf("error obteniendo propiedad horizontal: %w", err)
	}

	return r.mapToEntity(&business), nil
}

// UpdateHorizontalProperty actualiza una propiedad horizontal
func (r *Repository) UpdateHorizontalProperty(ctx context.Context, id uint, property *domain.HorizontalProperty) (*domain.HorizontalProperty, error) {
	businessModel := r.mapToBusinessModel(property)
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

	return r.mapToEntity(&updatedBusiness), nil
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

	// Mapear a DTOs de lista
	data := make([]domain.HorizontalPropertyListDTO, len(businesses))
	for i, business := range businesses {
		data[i] = domain.HorizontalPropertyListDTO{
			ID:               business.ID,
			Name:             business.Name,
			Code:             business.Code,
			BusinessTypeName: business.BusinessType.Name,
			Address:          business.Address,
			TotalUnits:       getTotalUnitsFromDescription(business.Description), // Temporal hasta que se agregue el campo
			IsActive:         business.IsActive,
			CreatedAt:        business.CreatedAt,
		}
	}

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

// Funciones auxiliares de mapeo

// mapToBusinessModel mapea una entidad de dominio a modelo GORM
func (r *Repository) mapToBusinessModel(property *domain.HorizontalProperty) *models.Business {
	business := &models.Business{
		Name:               property.Name,
		Code:               property.Code,
		BusinessTypeID:     property.BusinessTypeID,
		ParentBusinessID:   property.ParentBusinessID,
		Timezone:           property.Timezone,
		Address:            property.Address,
		Description:        property.Description,
		LogoURL:            property.LogoURL,
		PrimaryColor:       property.PrimaryColor,
		SecondaryColor:     property.SecondaryColor,
		TertiaryColor:      property.TertiaryColor,
		QuaternaryColor:    property.QuaternaryColor,
		NavbarImageURL:     property.NavbarImageURL,
		CustomDomain:       property.CustomDomain,
		EnableDelivery:     property.EnableDelivery,
		EnablePickup:       property.EnablePickup,
		EnableReservations: property.EnableReservations,
		IsActive:           property.IsActive,
	}

	// Solo establecer ID, CreatedAt, UpdatedAt si la entidad ya existe (para updates)
	if property.ID != 0 {
		business.ID = property.ID
		business.CreatedAt = property.CreatedAt
		business.UpdatedAt = property.UpdatedAt
	}

	return business
}

// mapToEntity mapea un modelo GORM a entidad de dominio
func (r *Repository) mapToEntity(business *models.Business) *domain.HorizontalProperty {
	return &domain.HorizontalProperty{
		ID:                 business.ID,
		Name:               business.Name,
		Code:               business.Code,
		BusinessTypeID:     business.BusinessTypeID,
		ParentBusinessID:   business.ParentBusinessID,
		Timezone:           business.Timezone,
		Address:            business.Address,
		Description:        business.Description,
		LogoURL:            business.LogoURL,
		PrimaryColor:       business.PrimaryColor,
		SecondaryColor:     business.SecondaryColor,
		TertiaryColor:      business.TertiaryColor,
		QuaternaryColor:    business.QuaternaryColor,
		NavbarImageURL:     business.NavbarImageURL,
		CustomDomain:       business.CustomDomain,
		EnableDelivery:     business.EnableDelivery,
		EnablePickup:       business.EnablePickup,
		EnableReservations: business.EnableReservations,
		// TODO: Mapear campos específicos de propiedad horizontal cuando se agreguen a Business
		TotalUnits:    getTotalUnitsFromDescription(business.Description), // Temporal
		TotalFloors:   nil,                                                // Temporal
		HasElevator:   false,                                              // Temporal
		HasParking:    false,                                              // Temporal
		HasPool:       false,                                              // Temporal
		HasGym:        false,                                              // Temporal
		HasSocialArea: false,                                              // Temporal
		IsActive:      business.IsActive,
		CreatedAt:     business.CreatedAt,
		UpdatedAt:     business.UpdatedAt,
	}
}

// getTotalUnitsFromDescription extrae el número de unidades de la descripción (temporal)
func getTotalUnitsFromDescription(description string) int {
	// Por ahora retornamos un valor por defecto
	// TODO: Implementar lógica para extraer o almacenar en campo separado
	return 1
}
