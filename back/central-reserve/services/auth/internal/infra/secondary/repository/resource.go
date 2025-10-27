package repository

import (
	"central_reserve/services/auth/internal/domain"
	"context"
	"dbpostgres/app/infra/models"
	"fmt"
	"strings"
	"time"
)

// GetResources obtiene todos los recursos con filtros y paginación
func (r *Repository) GetResources(ctx context.Context, filters domain.ResourceFilters) ([]domain.Resource, int64, error) {
	r.logger.Info().Interface("filters", filters).Msg("Iniciando búsqueda de recursos")

	// Configurar paginación por defecto
	if filters.PageSize <= 0 {
		filters.PageSize = 10
	}
	if filters.Page <= 0 {
		filters.Page = 1
	}

	offset := (filters.Page - 1) * filters.PageSize

	// Construir query base
	query := r.database.Conn(ctx).Model(&models.Resource{})

	// Aplicar filtros
	if filters.Name != "" {
		query = query.Where("name ILIKE ?", "%"+filters.Name+"%")
	}
	if filters.Description != "" {
		query = query.Where("description ILIKE ?", "%"+filters.Description+"%")
	}

	// Filtrar por business_type_id
	// Si es nil, solo muestra recursos genéricos (business_type_id IS NULL)
	// Si tiene valor, muestra recursos de ese tipo o genéricos
	if filters.BusinessTypeID != nil {
		query = query.Where("business_type_id = ? OR business_type_id IS NULL", *filters.BusinessTypeID)
	} else {
		// Si no se especifica business_type_id, mostrar todos los recursos
		// (tanto genéricos como específicos por tipo)
		// No aplicar ningún filtro adicional
	}

	// Contar total antes de aplicar paginación
	var total int64
	if err := query.Count(&total).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al contar recursos")
		return nil, 0, err
	}

	// Aplicar ordenamiento
	orderBy := "created_at DESC" // Por defecto
	if filters.SortBy != "" {
		direction := "ASC"
		if strings.ToUpper(filters.SortOrder) == "DESC" {
			direction = "DESC"
		}

		// Validar campos de ordenamiento permitidos
		allowedSortFields := map[string]bool{
			"name":       true,
			"created_at": true,
			"updated_at": true,
		}

		if allowedSortFields[filters.SortBy] {
			orderBy = fmt.Sprintf("%s %s", filters.SortBy, direction)
		}
	}

	// Aplicar paginación y ordenamiento con preload de BusinessType
	var resources []models.Resource
	if err := query.Preload("BusinessType").Order(orderBy).Offset(offset).Limit(filters.PageSize).Find(&resources).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al obtener recursos")
		return nil, 0, err
	}

	// Convertir a entidades de dominio
	var domainResources []domain.Resource
	for _, resource := range resources {
		var deletedAt *time.Time
		if resource.DeletedAt.Valid {
			deletedAt = &resource.DeletedAt.Time
		}

		businessTypeID := uint(0)
		businessTypeName := ""
		if resource.BusinessTypeID != nil {
			businessTypeID = *resource.BusinessTypeID
			if resource.BusinessType != nil {
				businessTypeName = resource.BusinessType.Name
			}
		}

		domainResources = append(domainResources, domain.Resource{
			ID:               resource.ID,
			Name:             resource.Name,
			Description:      resource.Description,
			BusinessTypeID:   businessTypeID,
			BusinessTypeName: businessTypeName,
			CreatedAt:        resource.CreatedAt,
			UpdatedAt:        resource.UpdatedAt,
			DeletedAt:        deletedAt,
		})
	}

	r.logger.Info().
		Int64("total", total).
		Int("returned", len(domainResources)).
		Int("page", filters.Page).
		Int("page_size", filters.PageSize).
		Msg("Recursos obtenidos exitosamente")

	return domainResources, total, nil
}

// GetResourceByID obtiene un recurso por su ID
func (r *Repository) GetResourceByID(ctx context.Context, id uint) (*domain.Resource, error) {
	r.logger.Info().Uint("resource_id", id).Msg("Obteniendo recurso por ID")

	var resource models.Resource
	if err := r.database.Conn(ctx).Where("id = ?", id).First(&resource).Error; err != nil {
		r.logger.Error().Err(err).Uint("resource_id", id).Msg("Error al obtener recurso por ID")
		return nil, err
	}

	var deletedAt *time.Time
	if resource.DeletedAt.Valid {
		deletedAt = &resource.DeletedAt.Time
	}

	businessTypeID := uint(0)
	businessTypeName := ""
	if resource.BusinessTypeID != nil {
		businessTypeID = *resource.BusinessTypeID
		if resource.BusinessType != nil {
			businessTypeName = resource.BusinessType.Name
		}
	}

	domainResource := &domain.Resource{
		ID:               resource.ID,
		Name:             resource.Name,
		Description:      resource.Description,
		BusinessTypeID:   businessTypeID,
		BusinessTypeName: businessTypeName,
		CreatedAt:        resource.CreatedAt,
		UpdatedAt:        resource.UpdatedAt,
		DeletedAt:        deletedAt,
	}

	r.logger.Info().Uint("resource_id", id).Str("name", resource.Name).Msg("Recurso obtenido exitosamente")
	return domainResource, nil
}

// GetResourceByName obtiene un recurso por su nombre
func (r *Repository) GetResourceByName(ctx context.Context, name string) (*domain.Resource, error) {
	r.logger.Info().Str("name", name).Msg("Obteniendo recurso por nombre")

	var resource models.Resource
	if err := r.database.Conn(ctx).Where("name = ?", name).First(&resource).Error; err != nil {
		r.logger.Error().Err(err).Str("name", name).Msg("Error al obtener recurso por nombre")
		return nil, err
	}

	var deletedAt *time.Time
	if resource.DeletedAt.Valid {
		deletedAt = &resource.DeletedAt.Time
	}

	businessTypeID := uint(0)
	businessTypeName := ""
	if resource.BusinessTypeID != nil {
		businessTypeID = *resource.BusinessTypeID
		if resource.BusinessType != nil {
			businessTypeName = resource.BusinessType.Name
		}
	}

	domainResource := &domain.Resource{
		ID:               resource.ID,
		Name:             resource.Name,
		Description:      resource.Description,
		BusinessTypeID:   businessTypeID,
		BusinessTypeName: businessTypeName,
		CreatedAt:        resource.CreatedAt,
		UpdatedAt:        resource.UpdatedAt,
		DeletedAt:        deletedAt,
	}

	r.logger.Info().Uint("resource_id", resource.ID).Str("name", name).Msg("Recurso obtenido exitosamente por nombre")
	return domainResource, nil
}

// CreateResource crea un nuevo recurso
func (r *Repository) CreateResource(ctx context.Context, resource domain.Resource) (uint, error) {
	r.logger.Info().Str("name", resource.Name).Msg("Creando nuevo recurso")

	modelResource := models.Resource{
		Name:        resource.Name,
		Description: resource.Description,
	}

	// Agregar business_type_id si está presente
	if resource.BusinessTypeID > 0 {
		btID := resource.BusinessTypeID
		modelResource.BusinessTypeID = &btID
	}

	if err := r.database.Conn(ctx).Create(&modelResource).Error; err != nil {
		r.logger.Error().Err(err).Str("name", resource.Name).Msg("Error al crear recurso")
		return 0, err
	}

	r.logger.Info().
		Uint("resource_id", modelResource.ID).
		Str("name", resource.Name).
		Msg("Recurso creado exitosamente")

	return modelResource.ID, nil
}

// UpdateResource actualiza un recurso existente
func (r *Repository) UpdateResource(ctx context.Context, id uint, resource domain.Resource) (string, error) {
	r.logger.Info().Uint("resource_id", id).Str("name", resource.Name).Msg("Actualizando recurso")

	updateData := map[string]interface{}{
		"name":        resource.Name,
		"description": resource.Description,
	}

	// Agregar business_type_id si está presente
	if resource.BusinessTypeID > 0 {
		btID := resource.BusinessTypeID
		updateData["business_type_id"] = &btID
	}

	result := r.database.Conn(ctx).Model(&models.Resource{}).Where("id = ?", id).Updates(updateData)
	if result.Error != nil {
		r.logger.Error().Err(result.Error).Uint("resource_id", id).Msg("Error al actualizar recurso")
		return "", result.Error
	}

	if result.RowsAffected == 0 {
		r.logger.Warn().Uint("resource_id", id).Msg("Recurso no encontrado para actualizar")
		return "", fmt.Errorf("recurso con ID %d no encontrado", id)
	}

	message := fmt.Sprintf("Recurso actualizado con ID: %d", id)
	r.logger.Info().Uint("resource_id", id).Msg("Recurso actualizado exitosamente")

	return message, nil
}

// DeleteResource elimina un recurso (soft delete)
func (r *Repository) DeleteResource(ctx context.Context, id uint) (string, error) {
	r.logger.Info().Uint("resource_id", id).Msg("Eliminando recurso")

	result := r.database.Conn(ctx).Delete(&models.Resource{}, id)
	if result.Error != nil {
		r.logger.Error().Err(result.Error).Uint("resource_id", id).Msg("Error al eliminar recurso")
		return "", result.Error
	}

	if result.RowsAffected == 0 {
		r.logger.Warn().Uint("resource_id", id).Msg("Recurso no encontrado para eliminar")
		return "", fmt.Errorf("recurso con ID %d no encontrado", id)
	}

	message := fmt.Sprintf("Recurso eliminado con ID: %d", id)
	r.logger.Info().Uint("resource_id", id).Msg("Recurso eliminado exitosamente")

	return message, nil
}
