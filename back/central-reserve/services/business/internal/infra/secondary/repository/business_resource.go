package repository

import (
	"context"
	"errors"

	"central_reserve/services/business/internal/domain"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

// GetBusinessTypeResourcesPermitted obtiene los recursos permitidos para un tipo de negocio
func (r *Repository) GetBusinessTypeResourcesPermitted(ctx context.Context, businessTypeID uint) ([]domain.BusinessTypeResourcePermitted, error) {
	var resourcesModel []models.BusinessTypeResourcePermitted

	// Usar GORM con preload para obtener la relación con Resource
	err := r.database.Conn(ctx).
		Model(&models.BusinessTypeResourcePermitted{}).
		Preload("Resource").
		Where("business_type_id = ?", businessTypeID).
		Order("id ASC").
		Find(&resourcesModel).Error

	if err != nil {
		r.logger.Error().Err(err).Uint("business_type_id", businessTypeID).Msg("[business_resource_repository] Error al obtener recursos permitidos del tipo de negocio")
		return nil, errors.New("error interno del servidor")
	}

	// Convertir a entidades de dominio
	resources := make([]domain.BusinessTypeResourcePermitted, len(resourcesModel))
	for i, model := range resourcesModel {
		resources[i] = domain.BusinessTypeResourcePermitted{
			ID:             model.ID,
			BusinessTypeID: model.BusinessTypeID,
			ResourceID:     model.ResourceID,
			ResourceName:   model.Resource.Name,
			CreatedAt:      model.CreatedAt,
			UpdatedAt:      model.UpdatedAt,
		}
	}

	return resources, nil
}

// UpdateBusinessTypeResourcesPermitted actualiza los recursos permitidos para un tipo de negocio
func (r *Repository) UpdateBusinessTypeResourcesPermitted(ctx context.Context, businessTypeID uint, resourcesIDs []uint) error {
	// Verificar que el tipo de negocio existe usando el modelo
	var businessTypeModel models.BusinessType
	if err := r.database.Conn(ctx).First(&businessTypeModel, businessTypeID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			r.logger.Error().Uint("business_type_id", businessTypeID).Msg("[business_resource_repository] Tipo de negocio no encontrado")
			return errors.New("tipo de negocio no encontrado")
		}
		r.logger.Error().Err(err).Uint("business_type_id", businessTypeID).Msg("[business_resource_repository] Error al verificar tipo de negocio")
		return errors.New("error interno del servidor")
	}

	// Verificar que todos los recursos existen usando el modelo
	if len(resourcesIDs) > 0 {
		var count int64
		if err := r.database.Conn(ctx).Model(&models.Resource{}).Where("id IN ?", resourcesIDs).Count(&count).Error; err != nil {
			r.logger.Error().Err(err).Int("resources_ids", len(resourcesIDs)).Msg("[business_resource_repository] Error al verificar recursos")
			return errors.New("error interno del servidor")
		}

		if int64(len(resourcesIDs)) != count {
			r.logger.Error().Int("requested", len(resourcesIDs)).Int64("found", count).Msg("[business_resource_repository] Algunos recursos no existen")
			return errors.New("algunos recursos especificados no existen")
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

	// Eliminar todas las asociaciones existentes usando el modelo
	if err := tx.Where("business_type_id = ?", businessTypeID).Delete(&models.BusinessTypeResourcePermitted{}).Error; err != nil {
		tx.Rollback()
		r.logger.Error().Err(err).Uint("business_type_id", businessTypeID).Msg("[business_resource_repository] Error al eliminar recursos permitidos existentes")
		return errors.New("error interno del servidor")
	}

	// Crear las nuevas asociaciones usando el modelo
	for _, resourceID := range resourcesIDs {
		newResource := models.BusinessTypeResourcePermitted{
			BusinessTypeID: businessTypeID,
			ResourceID:     resourceID,
		}

		if err := tx.Create(&newResource).Error; err != nil {
			tx.Rollback()
			r.logger.Error().Err(err).Uint("business_type_id", businessTypeID).Uint("resource_id", resourceID).Msg("[business_resource_repository] Error al crear recurso permitido")
			return errors.New("error interno del servidor")
		}
	}

	// Confirmar transacción
	if err := tx.Commit().Error; err != nil {
		r.logger.Error().Err(err).Msg("[business_resource_repository] Error al confirmar transacción")
		return errors.New("error interno del servidor")
	}

	r.logger.Info().Uint("business_type_id", businessTypeID).Int("resources_count", len(resourcesIDs)).Msg("[business_resource_repository] Recursos del tipo de negocio actualizados exitosamente")

	return nil
}

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
		// Obtener recursos para este tipo de negocio usando GORM con relaciones
		var resourcesModel []models.BusinessTypeResourcePermitted
		if err := r.database.Conn(ctx).
			Model(&models.BusinessTypeResourcePermitted{}).
			Preload("Resource").
			Where("business_type_id = ?", btModel.ID).
			Find(&resourcesModel).Error; err != nil {
			r.logger.Error().Err(err).Uint("business_type_id", btModel.ID).Msg("[business_resource_repository] Error al obtener recursos del tipo de negocio")
			// Continuar con array vacío en caso de error
			resourcesModel = []models.BusinessTypeResourcePermitted{}
		}

		// Convertir recursos a respuesta de dominio
		resourcesResponse := make([]domain.BusinessTypeResourcePermittedResponse, len(resourcesModel))
		for i, resourceModel := range resourcesModel {
			resourcesResponse[i] = domain.BusinessTypeResourcePermittedResponse{
				ID:           resourceModel.ID,
				ResourceID:   resourceModel.ResourceID,
				ResourceName: resourceModel.Resource.Name,
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
func (r *Repository) GetBusinessesWithConfiguredResourcesPaginated(ctx context.Context, page, perPage int, businessID *uint) ([]domain.BusinessWithConfiguredResourcesResponse, int64, error) {
	var total int64

	// Calcular offset
	offset := (page - 1) * perPage

	// Construir query base
	query := r.database.Conn(ctx).Model(&models.Business{})

	// Aplicar filtro por business ID si se proporciona
	if businessID != nil {
		query = query.Where("id = ?", *businessID)
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
			Preload("BusinessTypeResourcePermitted.Resource").
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
				ResourceID:   resourceModel.BusinessTypeResourcePermitted.ResourceID,
				ResourceName: resourceModel.BusinessTypeResourcePermitted.Resource.Name,
				IsActive:     true, // Si está configurado, está activo
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

	// Obtener los recursos permitidos para el tipo de business
	var permittedResourcesModel []models.BusinessTypeResourcePermitted
	if err := r.database.Conn(ctx).
		Model(&models.BusinessTypeResourcePermitted{}).
		Where("business_type_id = ?", businessModel.BusinessTypeID).
		Find(&permittedResourcesModel).Error; err != nil {
		r.logger.Error().Err(err).Uint("business_type_id", businessModel.BusinessTypeID).Msg("[business_resource_repository] Error al obtener recursos permitidos")
		return errors.New("error interno del servidor")
	}

	// Crear mapa de recursos permitidos para validación rápida
	permittedResourcesMap := make(map[uint]uint) // resourceID -> businessTypeResourcePermittedID
	for _, permitted := range permittedResourcesModel {
		permittedResourcesMap[permitted.ResourceID] = permitted.ID
	}

	// Validar que todos los recursos solicitados están permitidos para este tipo de business
	var validResourcesPermittedIDs []uint
	for _, resourceID := range resourcesIDs {
		if permittedID, exists := permittedResourcesMap[resourceID]; exists {
			validResourcesPermittedIDs = append(validResourcesPermittedIDs, permittedID)
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
	for _, permittedID := range validResourcesPermittedIDs {
		newConfigured := models.BusinessResourceConfigured{
			BusinessID:                      businessID,
			BusinessTypeResourcePermittedID: permittedID,
			BusinessTypeID:                  businessModel.BusinessTypeID,
		}

		if err := tx.Create(&newConfigured).Error; err != nil {
			tx.Rollback()
			r.logger.Error().Err(err).Uint("business_id", businessID).Uint("permitted_id", permittedID).Msg("[business_resource_repository] Error al crear recurso configurado")
			return errors.New("error interno del servidor")
		}
	}

	// Confirmar transacción
	if err := tx.Commit().Error; err != nil {
		r.logger.Error().Err(err).Msg("[business_resource_repository] Error al confirmar transacción")
		return errors.New("error interno del servidor")
	}

	r.logger.Info().Uint("business_id", businessID).Int("resources_count", len(validResourcesPermittedIDs)).Msg("[business_resource_repository] Recursos configurados del business actualizados exitosamente")

	return nil
}
