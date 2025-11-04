package repository

import (
	"context"
	"errors"

	"central_reserve/services/business/internal/domain"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

// GetBusinessTypeResourcesPermitted obtiene los recursos permitidos para un tipo de negocio
// Ahora consulta directamente a Resources filtrando por business_type_id (incluye recursos genéricos con business_type_id = NULL)
func (r *Repository) GetBusinessTypeResourcesPermitted(ctx context.Context, businessTypeID uint) ([]domain.BusinessTypeResourcePermitted, error) {
	var resourcesModel []models.Resource

	// Consultar recursos: los del tipo específico Y los genéricos (business_type_id IS NULL)
	err := r.database.Conn(ctx).
		Model(&models.Resource{}).
		Where("business_type_id = ? OR business_type_id IS NULL", businessTypeID).
		Order("id ASC").
		Find(&resourcesModel).Error

	if err != nil {
		r.logger.Error().Err(err).Uint("business_type_id", businessTypeID).Msg("[business_resource_repository] Error al obtener recursos permitidos del tipo de negocio")
		return nil, errors.New("error interno del servidor")
	}

	// Convertir a entidades de dominio
	resources := make([]domain.BusinessTypeResourcePermitted, len(resourcesModel))
	for i, model := range resourcesModel {
		// Si el resource tiene business_type_id, usarlo; si es NULL, usar el del parámetro
		btID := businessTypeID
		if model.BusinessTypeID != nil {
			btID = *model.BusinessTypeID
		}

		resources[i] = domain.BusinessTypeResourcePermitted{
			ID:             model.ID,
			BusinessTypeID: btID,
			ResourceID:     model.ID,
			ResourceName:   model.Name,
			CreatedAt:      model.CreatedAt,
			UpdatedAt:      model.UpdatedAt,
		}
	}

	return resources, nil
}

// UpdateBusinessTypeResourcesPermitted NO DEBE EXISTIR
// Los recursos ahora se gestionan directamente en la tabla Resource (agregando/quitando business_type_id)
// Este método debería eliminarse o implementarse de otra forma

// GetResourceByID obtiene un recurso por su ID
func (r *Repository) GetResourceByID(ctx context.Context, resourceID uint) (*domain.Resource, error) {
	var resourceModel models.Resource

	if err := r.database.Conn(ctx).First(&resourceModel, resourceID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("recurso no encontrado")
		}
		r.logger.Error().Err(err).Uint("resource_id", resourceID).Msg("[business_resource_repository] Error al obtener recurso por ID")
		return nil, errors.New("error interno del servidor")
	}

	// Convertir a entidad de dominio
	resource := &domain.Resource{
		ID:        resourceModel.ID,
		Name:      resourceModel.Name,
		CreatedAt: resourceModel.CreatedAt,
		UpdatedAt: resourceModel.UpdatedAt,
	}

	return resource, nil
}

// GetBusinessTypesWithResourcesPaginated obtiene todos los tipos de negocio con sus recursos asociados con paginación
func (r *Repository) GetBusinessTypesWithResourcesPaginated(ctx context.Context, page, perPage int, businessTypeID *uint) ([]domain.BusinessTypeWithResourcesResponse, int64, error) {
	var total int64

	// Calcular offset
	offset := (page - 1) * perPage

	// Construir query base
	query := r.database.Conn(ctx).Model(&models.BusinessType{})

	// Aplicar filtro por business type si se proporciona
	if businessTypeID != nil {
		query = query.Where("id = ?", *businessTypeID)
	}

	// Contar total de tipos de negocio
	if err := query.Count(&total).Error; err != nil {
		r.logger.Error().Err(err).Msg("[business_resource_repository] Error al contar tipos de negocio")
		return nil, 0, errors.New("error interno del servidor")
	}

	// Obtener los tipos de negocio con paginación usando GORM
	var businessTypesModel []models.BusinessType
	if err := query.
		Order("name ASC").
		Limit(perPage).
		Offset(offset).
		Find(&businessTypesModel).Error; err != nil {
		r.logger.Error().Err(err).Int("page", page).Int("per_page", perPage).Msg("[business_resource_repository] Error al obtener tipos de negocio")
		return nil, 0, errors.New("error interno del servidor")
	}

	// Construir respuesta con recursos para cada tipo de negocio
	var businessTypes []domain.BusinessTypeWithResourcesResponse
	for _, btModel := range businessTypesModel {
		// Obtener recursos para este tipo de negocio consultando directamente Resources
		var resourcesModel []models.Resource
		if err := r.database.Conn(ctx).
			Model(&models.Resource{}).
			Where("business_type_id = ? OR business_type_id IS NULL", btModel.ID).
			Find(&resourcesModel).Error; err != nil {
			r.logger.Error().Err(err).Uint("business_type_id", btModel.ID).Msg("[business_resource_repository] Error al obtener recursos del tipo de negocio")
			// Continuar con array vacío en caso de error
			resourcesModel = []models.Resource{}
		}

		// Convertir recursos a respuesta de dominio
		resourcesResponse := make([]domain.BusinessTypeResourcePermittedResponse, len(resourcesModel))
		for i, resourceModel := range resourcesModel {
			resourcesResponse[i] = domain.BusinessTypeResourcePermittedResponse{
				ID:           resourceModel.ID,
				ResourceID:   resourceModel.ID,
				ResourceName: resourceModel.Name,
			}
		}

		// Convertir tipo de negocio a respuesta de dominio
		businessType := domain.BusinessTypeWithResourcesResponse{
			ID:        btModel.ID,
			Name:      btModel.Name,
			Resources: resourcesResponse,
			CreatedAt: btModel.CreatedAt,
			UpdatedAt: btModel.UpdatedAt,
		}

		businessTypes = append(businessTypes, businessType)
	}

	return businessTypes, total, nil
}

// GetBusinessesWithConfiguredResourcesPaginated obtiene todos los business con sus recursos configurados con paginación
func (r *Repository) GetBusinessesWithConfiguredResourcesPaginated(ctx context.Context, page, perPage int, businessID *uint, businessTypeID *uint) ([]domain.BusinessWithConfiguredResourcesResponse, int64, error) {
	var total int64

	// Calcular offset
	offset := (page - 1) * perPage

	// Construir query base
	query := r.database.Conn(ctx).Model(&models.Business{})

	// Aplicar filtro por business ID si se proporciona
	if businessID != nil {
		query = query.Where("id = ?", *businessID)
	}

	// Aplicar filtro por business type ID si se proporciona
	if businessTypeID != nil {
		query = query.Where("business_type_id = ?", *businessTypeID)
	}

	// Contar total de business
	if err := query.Count(&total).Error; err != nil {
		r.logger.Error().Err(err).Msg("[business_resource_repository] Error al contar business")
		return nil, 0, errors.New("error interno del servidor")
	}

	// Obtener los business con paginación usando GORM
	var businessesModel []models.Business
	if err := query.
		Order("name ASC").
		Limit(perPage).
		Offset(offset).
		Find(&businessesModel).Error; err != nil {
		r.logger.Error().Err(err).Int("page", page).Int("per_page", perPage).Msg("[business_resource_repository] Error al obtener business")
		return nil, 0, errors.New("error interno del servidor")
	}

	// Construir respuesta con recursos configurados para cada business
	var businesses []domain.BusinessWithConfiguredResourcesResponse
	for _, businessModel := range businessesModel {
		// Obtener recursos configurados para este business usando GORM con relaciones
		var configuredResourcesModel []models.BusinessResourceConfigured
		if err := r.database.Conn(ctx).
			Model(&models.BusinessResourceConfigured{}).
			Preload("Resource").
			Where("business_id = ?", businessModel.ID).
			Find(&configuredResourcesModel).Error; err != nil {
			r.logger.Error().Err(err).Uint("business_id", businessModel.ID).Msg("[business_resource_repository] Error al obtener recursos configurados del business")
			// Continuar con array vacío en caso de error
			configuredResourcesModel = []models.BusinessResourceConfigured{}
		}

		// Convertir recursos configurados a respuesta de dominio
		resourcesResponse := make([]domain.BusinessResourceConfiguredResponse, len(configuredResourcesModel))
		for i, resourceModel := range configuredResourcesModel {
			resourcesResponse[i] = domain.BusinessResourceConfiguredResponse{
				ResourceID:   resourceModel.ResourceID,
				ResourceName: resourceModel.Resource.Name,
				IsActive:     resourceModel.Active, // Usar el campo Active del modelo
			}
		}

		// Convertir business a respuesta de dominio
		business := domain.BusinessWithConfiguredResourcesResponse{
			ID:        businessModel.ID,
			Name:      businessModel.Name,
			Code:      businessModel.Code,
			Resources: resourcesResponse,
			CreatedAt: businessModel.CreatedAt,
			UpdatedAt: businessModel.UpdatedAt,
		}

		businesses = append(businesses, business)
	}

	return businesses, total, nil
}

// GetBusinessByIDWithConfiguredResources obtiene un business por ID con sus recursos configurados
func (r *Repository) GetBusinessByIDWithConfiguredResources(ctx context.Context, businessID uint) (*domain.BusinessWithConfiguredResourcesResponse, error) {
	// Obtener el business
	var businessModel models.Business
	if err := r.database.Conn(ctx).
		Where("id = ?", businessID).
		First(&businessModel).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			r.logger.Error().Uint("business_id", businessID).Msg("[business_resource_repository] Business no encontrado")
			return nil, errors.New("business no encontrado")
		}
		r.logger.Error().Err(err).Uint("business_id", businessID).Msg("[business_resource_repository] Error al obtener business")
		return nil, errors.New("error interno del servidor")
	}

	// Obtener recursos configurados para este business usando GORM con relaciones
	var configuredResourcesModel []models.BusinessResourceConfigured
	if err := r.database.Conn(ctx).
		Model(&models.BusinessResourceConfigured{}).
		Preload("Resource").
		Where("business_id = ?", businessModel.ID).
		Find(&configuredResourcesModel).Error; err != nil {
		r.logger.Error().Err(err).Uint("business_id", businessModel.ID).Msg("[business_resource_repository] Error al obtener recursos configurados del business")
		// Continuar con array vacío en caso de error
		configuredResourcesModel = []models.BusinessResourceConfigured{}
	}

	// Convertir recursos configurados a respuesta de dominio
	resourcesResponse := make([]domain.BusinessResourceConfiguredResponse, len(configuredResourcesModel))
	for i, resourceModel := range configuredResourcesModel {
		resourcesResponse[i] = domain.BusinessResourceConfiguredResponse{
			ResourceID:   resourceModel.ResourceID,
			ResourceName: resourceModel.Resource.Name,
			IsActive:     resourceModel.Active,
		}
	}

	// Convertir business a respuesta de dominio
	business := &domain.BusinessWithConfiguredResourcesResponse{
		ID:        businessModel.ID,
		Name:      businessModel.Name,
		Code:      businessModel.Code,
		Resources: resourcesResponse,
		CreatedAt: businessModel.CreatedAt,
		UpdatedAt: businessModel.UpdatedAt,
	}

	return business, nil
}

// UpdateBusinessConfiguredResources actualiza los recursos configurados para un business específico
func (r *Repository) UpdateBusinessConfiguredResources(ctx context.Context, businessID uint, resourcesIDs []uint) error {
	// Verificar que el business existe y obtener su tipo
	var businessModel models.Business
	if err := r.database.Conn(ctx).Preload("BusinessType").First(&businessModel, businessID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			r.logger.Error().Uint("business_id", businessID).Msg("[business_resource_repository] Business no encontrado")
			return errors.New("business no encontrado")
		}
		r.logger.Error().Err(err).Uint("business_id", businessID).Msg("[business_resource_repository] Error al verificar business")
		return errors.New("error interno del servidor")
	}

	// Obtener los recursos permitidos para el tipo de business (usando GetBusinessTypeResourcesPermitted)
	permittedResources, err := r.GetBusinessTypeResourcesPermitted(ctx, businessModel.BusinessTypeID)
	if err != nil {
		r.logger.Error().Err(err).Uint("business_type_id", businessModel.BusinessTypeID).Msg("[business_resource_repository] Error al obtener recursos permitidos")
		return errors.New("error interno del servidor")
	}

	// Crear mapa de recursos permitidos para validación rápida
	permittedResourcesMap := make(map[uint]bool)
	for _, permitted := range permittedResources {
		permittedResourcesMap[permitted.ResourceID] = true
	}

	// Validar que todos los recursos solicitados están permitidos para este tipo de business
	var validResourcesIDs []uint
	for _, resourceID := range resourcesIDs {
		if permittedResourcesMap[resourceID] {
			validResourcesIDs = append(validResourcesIDs, resourceID)
		} else {
			r.logger.Error().Uint("resource_id", resourceID).Uint("business_type_id", businessModel.BusinessTypeID).Msg("[business_resource_repository] Recurso no permitido para este tipo de business")
			return errors.New("algunos recursos no están permitidos para este tipo de business")
		}
	}

	// Iniciar transacción
	tx := r.database.Conn(ctx).Begin()
	if tx.Error != nil {
		r.logger.Error().Err(tx.Error).Msg("[business_resource_repository] Error al iniciar transacción")
		return errors.New("error interno del servidor")
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Eliminar todas las configuraciones existentes
	if err := tx.Where("business_id = ?", businessID).Delete(&models.BusinessResourceConfigured{}).Error; err != nil {
		tx.Rollback()
		r.logger.Error().Err(err).Uint("business_id", businessID).Msg("[business_resource_repository] Error al eliminar recursos configurados existentes")
		return errors.New("error interno del servidor")
	}

	// Crear las nuevas configuraciones
	for _, resourceID := range validResourcesIDs {
		newConfigured := models.BusinessResourceConfigured{
			BusinessID: businessID,
			ResourceID: resourceID,
			Active:     true, // Por defecto activo
		}

		if err := tx.Create(&newConfigured).Error; err != nil {
			tx.Rollback()
			r.logger.Error().Err(err).Uint("business_id", businessID).Uint("resource_id", resourceID).Msg("[business_resource_repository] Error al crear recurso configurado")
			return errors.New("error interno del servidor")
		}
	}

	// Confirmar transacción
	if err := tx.Commit().Error; err != nil {
		r.logger.Error().Err(err).Msg("[business_resource_repository] Error al confirmar transacción")
		return errors.New("error interno del servidor")
	}

	r.logger.Info().Uint("business_id", businessID).Int("resources_count", len(validResourcesIDs)).Msg("[business_resource_repository] Recursos configurados del business actualizados exitosamente")

	return nil
}

// GetBusinessConfiguredResourcesIDs obtiene los IDs de recursos configurados para un business específico
func (r *Repository) GetBusinessConfiguredResourcesIDs(ctx context.Context, businessID uint) ([]uint, error) {
	var resourcesIDs []uint

	err := r.database.Conn(ctx).
		Model(&models.BusinessResourceConfigured{}).
		Where("business_id = ?", businessID).
		Pluck("resource_id", &resourcesIDs).Error

	if err != nil {
		r.logger.Error().Err(err).Uint("business_id", businessID).Msg("[business_resource_repository] Error al obtener recursos configurados del business")
		return nil, err
	}

	r.logger.Info().Uint("business_id", businessID).Int("resources_count", len(resourcesIDs)).Msg("[business_resource_repository] Recursos configurados del business obtenidos exitosamente")

	return resourcesIDs, nil
}

// ToggleBusinessResourceActive activa o desactiva un recurso para un business específico
func (r *Repository) ToggleBusinessResourceActive(ctx context.Context, businessID uint, resourceID uint, active bool) error {
	r.logger.Info().Uint("business_id", businessID).Uint("resource_id", resourceID).Bool("active", active).Msg("Cambiando estado de activación del recurso para el business")

	// Verificar que la relación existe
	var configuredResource models.BusinessResourceConfigured
	if err := r.database.Conn(ctx).
		Where("business_id = ? AND resource_id = ?", businessID, resourceID).
		First(&configuredResource).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			r.logger.Error().Uint("business_id", businessID).Uint("resource_id", resourceID).Msg("[business_resource_repository] Relación no encontrada")
			return errors.New("la relación entre business y recurso no existe")
		}
		r.logger.Error().Err(err).Uint("business_id", businessID).Uint("resource_id", resourceID).Msg("[business_resource_repository] Error al buscar relación")
		return errors.New("error interno del servidor")
	}

	// Actualizar el estado activo
	result := r.database.Conn(ctx).
		Model(&models.BusinessResourceConfigured{}).
		Where("business_id = ? AND resource_id = ?", businessID, resourceID).
		Update("active", active)

	if result.Error != nil {
		r.logger.Error().Err(result.Error).Uint("business_id", businessID).Uint("resource_id", resourceID).Msg("[business_resource_repository] Error al actualizar estado del recurso")
		return errors.New("error interno del servidor")
	}

	r.logger.Info().Uint("business_id", businessID).Uint("resource_id", resourceID).Bool("active", active).Msg("[business_resource_repository] Estado del recurso actualizado exitosamente")

	return nil
}
