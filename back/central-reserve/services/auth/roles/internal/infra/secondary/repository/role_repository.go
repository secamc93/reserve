package repository

import (
	"central_reserve/services/auth/roles/internal/domain"
	"context"
	"dbpostgres/app/infra/models"
	"fmt"

	"gorm.io/gorm"
)

// CreateRole crea un nuevo rol en la base de datos
func (r *Repository) CreateRole(ctx context.Context, roleDTO domain.CreateRoleDTO) (*domain.Role, error) {
	// Crear el modelo de GORM
	role := models.Role{
		Name:           roleDTO.Name,
		Description:    roleDTO.Description,
		Level:          roleDTO.Level,
		IsSystem:       roleDTO.IsSystem,
		ScopeID:        roleDTO.ScopeID,
		BusinessTypeID: &roleDTO.BusinessTypeID, // Convertir a puntero
	}

	// Insertar en la base de datos
	err := r.database.Conn(ctx).Create(&role).Error
	if err != nil {
		r.logger.Error().
			Err(err).
			Str("name", roleDTO.Name).
			Msg("Error al crear rol en la base de datos")
		return nil, err
	}

	// Convertir a entidad de dominio
	domainRole := &domain.Role{
		ID:             role.ID,
		Name:           role.Name,
		Description:    role.Description,
		Level:          role.Level,
		IsSystem:       role.IsSystem,
		ScopeID:        role.ScopeID,
		BusinessTypeID: *role.BusinessTypeID, // Convertir de puntero a valor
		CreatedAt:      role.CreatedAt,
		UpdatedAt:      role.UpdatedAt,
	}

	r.logger.Info().
		Uint("role_id", role.ID).
		Str("name", role.Name).
		Msg("Rol creado exitosamente en la base de datos")

	return domainRole, nil
}

// GetRoleByID obtiene un rol por su ID
func (r *Repository) GetRoleByID(ctx context.Context, roleID uint) (*domain.Role, error) {
	var role models.Role

	err := r.database.Conn(ctx).
		Preload("Scope").
		Preload("BusinessType").
		Where("id = ?", roleID).
		First(&role).Error

	if err != nil {
		r.logger.Error().Uint("role_id", roleID).Err(err).Msg("Error al obtener rol por ID")
		return nil, err
	}

	businessTypeID := uint(0)
	businessTypeName := ""
	scopeName := ""
	scopeCode := ""
	if role.BusinessTypeID != nil {
		businessTypeID = *role.BusinessTypeID
	}
	if role.BusinessType != nil {
		businessTypeName = role.BusinessType.Name
	}
	if role.ScopeID > 0 && role.Scope.Name != "" {
		scopeName = role.Scope.Name
		scopeCode = role.Scope.Code
	}

	domainRole := &domain.Role{
		ID:               role.ID,
		Name:             role.Name,
		Description:      role.Description,
		Level:            role.Level,
		IsSystem:         role.IsSystem,
		ScopeID:          role.ScopeID,
		ScopeName:        scopeName,
		ScopeCode:        scopeCode,
		BusinessTypeID:   businessTypeID,
		BusinessTypeName: businessTypeName,
		CreatedAt:        role.CreatedAt,
		UpdatedAt:        role.UpdatedAt,
	}

	return domainRole, nil
}

// GetRoles obtiene roles filtrados y paginados
func (r *Repository) GetRoles(ctx context.Context, filters domain.RoleFilters) ([]domain.Role, int64, error) {
	var roles []models.Role
	var total int64

	query := r.database.Conn(ctx).Model(&models.Role{}).
		Preload("Scope").
		Preload("BusinessType")

	// Aplicar filtros
	if filters.BusinessTypeID != nil {
		query = query.Where("business_type_id = ?", *filters.BusinessTypeID)
	}

	if filters.ScopeID != nil {
		query = query.Where("scope_id = ?", *filters.ScopeID)
	}

	if filters.IsSystem != nil {
		query = query.Where("is_system = ?", *filters.IsSystem)
	}

	if filters.Name != nil && *filters.Name != "" {
		query = query.Where("name ILIKE ?", "%"+*filters.Name+"%")
	}

	if filters.Level != nil {
		query = query.Where("level = ?", *filters.Level)
	}

	// Ordenamiento
	if filters.SortBy != "" && filters.SortOrder != "" {
		orderClause := filters.SortBy + " " + filters.SortOrder
		query = query.Order(orderClause)
	} else {
		query = query.Order("created_at desc") // Por defecto
	}

	// Contar total antes de paginación
	if err := query.Count(&total).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al contar roles")
		return nil, 0, err
	}

	// Paginación
	offset := (filters.Page - 1) * filters.PageSize
	query = query.Offset(offset).Limit(filters.PageSize)

	if err := query.Find(&roles).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al obtener roles")
		return nil, 0, err
	}

	domainRoles := make([]domain.Role, len(roles))
	for i, role := range roles {
		businessTypeID := uint(0)
		businessTypeName := ""
		scopeName := ""
		scopeCode := ""

		if role.BusinessTypeID != nil {
			businessTypeID = *role.BusinessTypeID
			if role.BusinessType != nil {
				businessTypeName = role.BusinessType.Name
			}
		}

		if role.ScopeID > 0 && role.Scope.Name != "" {
			scopeName = role.Scope.Name
			scopeCode = role.Scope.Code
		}

		domainRoles[i] = domain.Role{
			ID:               role.ID,
			Name:             role.Name,
			Description:      role.Description,
			Level:            role.Level,
			IsSystem:         role.IsSystem,
			ScopeID:          role.ScopeID,
			ScopeName:        scopeName,
			ScopeCode:        scopeCode,
			BusinessTypeID:   businessTypeID,
			BusinessTypeName: businessTypeName,
			CreatedAt:        role.CreatedAt,
			UpdatedAt:        role.UpdatedAt,
		}
	}

	return domainRoles, total, nil
}

// GetRolesByLevel obtiene roles por nivel
func (r *Repository) GetRolesByLevel(ctx context.Context, level int) ([]domain.Role, error) {
	var roles []models.Role

	err := r.database.Conn(ctx).
		Preload("Scope").
		Preload("BusinessType").
		Where("level = ?", level).
		Find(&roles).Error

	if err != nil {
		r.logger.Error().Err(err).Int("level", level).Msg("Error al obtener roles por nivel")
		return nil, err
	}

	domainRoles := make([]domain.Role, len(roles))
	for i, role := range roles {
		businessTypeID := uint(0)
		businessTypeName := ""
		scopeName := ""
		scopeCode := ""
		if role.BusinessTypeID != nil {
			businessTypeID = *role.BusinessTypeID
		}
		if role.BusinessType != nil {
			businessTypeName = role.BusinessType.Name
		}
		if role.ScopeID > 0 && role.Scope.Name != "" {
			scopeName = role.Scope.Name
			scopeCode = role.Scope.Code
		}

		domainRoles[i] = domain.Role{
			ID:               role.ID,
			Name:             role.Name,
			Description:      role.Description,
			Level:            role.Level,
			IsSystem:         role.IsSystem,
			ScopeID:          role.ScopeID,
			ScopeName:        scopeName,
			ScopeCode:        scopeCode,
			BusinessTypeID:   businessTypeID,
			BusinessTypeName: businessTypeName,
			CreatedAt:        role.CreatedAt,
			UpdatedAt:        role.UpdatedAt,
		}
	}

	return domainRoles, nil
}

// GetRolesByScopeID obtiene roles por scope
func (r *Repository) GetRolesByScopeID(ctx context.Context, scopeID uint) ([]domain.Role, error) {
	var roles []models.Role

	err := r.database.Conn(ctx).
		Preload("Scope").
		Preload("BusinessType").
		Where("scope_id = ?", scopeID).
		Find(&roles).Error

	if err != nil {
		r.logger.Error().Err(err).Uint("scope_id", scopeID).Msg("Error al obtener roles por scope")
		return nil, err
	}

	domainRoles := make([]domain.Role, len(roles))
	for i, role := range roles {
		businessTypeID := uint(0)
		businessTypeName := ""
		scopeName := ""
		scopeCode := ""
		if role.BusinessTypeID != nil {
			businessTypeID = *role.BusinessTypeID
		}
		if role.BusinessType != nil {
			businessTypeName = role.BusinessType.Name
		}
		if role.ScopeID > 0 && role.Scope.Name != "" {
			scopeName = role.Scope.Name
			scopeCode = role.Scope.Code
		}

		domainRoles[i] = domain.Role{
			ID:               role.ID,
			Name:             role.Name,
			Description:      role.Description,
			Level:            role.Level,
			IsSystem:         role.IsSystem,
			ScopeID:          role.ScopeID,
			ScopeName:        scopeName,
			ScopeCode:        scopeCode,
			BusinessTypeID:   businessTypeID,
			BusinessTypeName: businessTypeName,
			CreatedAt:        role.CreatedAt,
			UpdatedAt:        role.UpdatedAt,
		}
	}

	return domainRoles, nil
}

// GetSystemRoles obtiene roles del sistema
func (r *Repository) GetSystemRoles(ctx context.Context) ([]domain.Role, error) {
	var roles []models.Role

	err := r.database.Conn(ctx).
		Preload("Scope").
		Preload("BusinessType").
		Where("is_system = ?", true).
		Find(&roles).Error

	if err != nil {
		r.logger.Error().Err(err).Msg("Error al obtener roles del sistema")
		return nil, err
	}

	domainRoles := make([]domain.Role, len(roles))
	for i, role := range roles {
		businessTypeID := uint(0)
		businessTypeName := ""
		scopeName := ""
		scopeCode := ""
		if role.BusinessTypeID != nil {
			businessTypeID = *role.BusinessTypeID
		}
		if role.BusinessType != nil {
			businessTypeName = role.BusinessType.Name
		}
		if role.ScopeID > 0 && role.Scope.Name != "" {
			scopeName = role.Scope.Name
			scopeCode = role.Scope.Code
		}

		domainRoles[i] = domain.Role{
			ID:               role.ID,
			Name:             role.Name,
			Description:      role.Description,
			Level:            role.Level,
			IsSystem:         role.IsSystem,
			ScopeID:          role.ScopeID,
			ScopeName:        scopeName,
			ScopeCode:        scopeCode,
			BusinessTypeID:   businessTypeID,
			BusinessTypeName: businessTypeName,
			CreatedAt:        role.CreatedAt,
			UpdatedAt:        role.UpdatedAt,
		}
	}

	return domainRoles, nil
}

// RoleExistsByName verifica si existe un rol con el nombre especificado
// excludeID permite excluir un rol específico (útil para actualizaciones)
func (r *Repository) RoleExistsByName(ctx context.Context, name string, excludeID *uint) (bool, error) {
	var count int64
	query := r.database.Conn(ctx).Model(&models.Role{}).Where("name = ?", name)

	if excludeID != nil {
		query = query.Where("id != ?", *excludeID)
	}

	if err := query.Count(&count).Error; err != nil {
		r.logger.Error().Err(err).Str("name", name).Msg("Error verificando existencia de rol por nombre")
		return false, fmt.Errorf("error verificando existencia de rol por nombre: %w", err)
	}
	return count > 0, nil
}

// UpdateRole actualiza un rol existente en la base de datos
func (r *Repository) UpdateRole(ctx context.Context, id uint, roleDTO domain.UpdateRoleDTO) (*domain.Role, error) {
	// Obtener el rol existente
	var existingRole models.Role
	err := r.database.Conn(ctx).Where("id = ?", id).First(&existingRole).Error
	if err != nil {
		r.logger.Error().
			Err(err).
			Uint("role_id", id).
			Msg("Error al obtener rol existente para actualizar")
		return nil, err
	}

	// Actualizar solo los campos que no son nil
	updates := make(map[string]interface{})

	if roleDTO.Name != nil {
		updates["name"] = *roleDTO.Name
	}
	if roleDTO.Description != nil {
		updates["description"] = *roleDTO.Description
	}
	if roleDTO.Level != nil {
		updates["level"] = *roleDTO.Level
	}
	if roleDTO.IsSystem != nil {
		updates["is_system"] = *roleDTO.IsSystem
	}
	if roleDTO.ScopeID != nil {
		updates["scope_id"] = *roleDTO.ScopeID
	}
	if roleDTO.BusinessTypeID != nil {
		updates["business_type_id"] = *roleDTO.BusinessTypeID
	}

	// Si no hay campos para actualizar, devolver el rol existente
	if len(updates) == 0 {
		r.logger.Warn().
			Uint("role_id", id).
			Msg("No hay campos para actualizar")

		// Convertir a entidad de dominio
		businessTypeID := uint(0)
		scopeName := ""
		scopeCode := ""
		if existingRole.BusinessTypeID != nil {
			businessTypeID = *existingRole.BusinessTypeID
		}

		return &domain.Role{
			ID:             existingRole.ID,
			Name:           existingRole.Name,
			Description:    existingRole.Description,
			Level:          existingRole.Level,
			IsSystem:       existingRole.IsSystem,
			ScopeID:        existingRole.ScopeID,
			ScopeName:      scopeName,
			ScopeCode:      scopeCode,
			BusinessTypeID: businessTypeID,
			CreatedAt:      existingRole.CreatedAt,
			UpdatedAt:      existingRole.UpdatedAt,
		}, nil
	}

	// Actualizar en la base de datos
	err = r.database.Conn(ctx).Model(&existingRole).Updates(updates).Error
	if err != nil {
		r.logger.Error().
			Err(err).
			Uint("role_id", id).
			Msg("Error al actualizar rol en la base de datos")
		return nil, err
	}

	// Obtener el rol actualizado con las relaciones
	var updatedRole models.Role
	err = r.database.Conn(ctx).
		Preload("Scope").
		Preload("BusinessType").
		Where("id = ?", id).
		First(&updatedRole).Error
	if err != nil {
		r.logger.Error().
			Err(err).
			Uint("role_id", id).
			Msg("Error al obtener rol actualizado")
		return nil, err
	}

	// Convertir a entidad de dominio
	businessTypeID := uint(0)
	businessTypeName := ""
	scopeName := ""
	scopeCode := ""
	if updatedRole.BusinessTypeID != nil {
		businessTypeID = *updatedRole.BusinessTypeID
	}
	if updatedRole.BusinessType != nil {
		businessTypeName = updatedRole.BusinessType.Name
	}
	if updatedRole.ScopeID > 0 && updatedRole.Scope.Name != "" {
		scopeName = updatedRole.Scope.Name
		scopeCode = updatedRole.Scope.Code
	}

	domainRole := &domain.Role{
		ID:               updatedRole.ID,
		Name:             updatedRole.Name,
		Description:      updatedRole.Description,
		Level:            updatedRole.Level,
		IsSystem:         updatedRole.IsSystem,
		ScopeID:          updatedRole.ScopeID,
		ScopeName:        scopeName,
		ScopeCode:        scopeCode,
		BusinessTypeID:   businessTypeID,
		BusinessTypeName: businessTypeName,
		CreatedAt:        updatedRole.CreatedAt,
		UpdatedAt:        updatedRole.UpdatedAt,
	}

	r.logger.Info().
		Uint("role_id", updatedRole.ID).
		Str("name", updatedRole.Name).
		Msg("Rol actualizado exitosamente en la base de datos")

	return domainRole, nil
}

// GetRolePermissions obtiene los permisos de un rol
func (r *Repository) GetRolePermissions(ctx context.Context, roleID uint) ([]domain.Permission, error) {
	var role models.Role
	var permissions []domain.Permission

	err := r.database.Conn(ctx).
		Model(&models.Role{}).
		Preload("Permissions.Scope").
		Preload("Permissions.Resource").
		Preload("Permissions.Action").
		Where("id = ?", roleID).
		First(&role).Error

	if err != nil {
		r.logger.Error().Uint("role_id", roleID).Msg("Error al obtener permisos del rol")
		return nil, err
	}

	for _, permission := range role.Permissions {
		businessTypeID := uint(0)
		businessTypeName := ""
		if permission.BusinessTypeID != nil {
			businessTypeID = *permission.BusinessTypeID
		}

		scopeName := ""
		scopeCode := ""
		if permission.ScopeID > 0 && permission.Scope.Name != "" {
			scopeName = permission.Scope.Name
			scopeCode = permission.Scope.Code
		}

		permissions = append(permissions, domain.Permission{
			ID:               permission.Model.ID,
			Name:             permission.Name,
			Description:      permission.Description,
			Resource:         permission.Resource.Name,
			Action:           permission.Action.Name,
			ResourceID:       permission.ResourceID,
			ActionID:         permission.ActionID,
			ScopeID:          permission.ScopeID,
			ScopeName:        scopeName,
			ScopeCode:        scopeCode,
			BusinessTypeID:   businessTypeID,
			BusinessTypeName: businessTypeName,
		})
	}

	return permissions, nil
}

// AssignPermissionsToRole asigna permisos a un rol
func (r *Repository) AssignPermissionsToRole(ctx context.Context, roleID uint, permissionIDs []uint) error {
	db := r.database.Conn(ctx)

	// Verificar que el rol existe y obtener su business_type_id
	var role models.Role
	err := db.Where("id = ?", roleID).First(&role).Error
	if err != nil {
		r.logger.Error().Uint("role_id", roleID).Err(err).Msg("Error al encontrar rol")
		return fmt.Errorf("rol no encontrado")
	}

	// Si el rol tiene business_type_id, validar que los permisos pertenezcan al mismo business_type
	if role.BusinessTypeID != nil && len(permissionIDs) > 0 {
		var permissions []models.Permission
		err := db.Where("id IN ?", permissionIDs).Find(&permissions).Error
		if err != nil {
			r.logger.Error().Uint("role_id", roleID).Err(err).Msg("Error al verificar permisos")
			return fmt.Errorf("error al verificar permisos")
		}

		// Validar que todos los permisos pertenezcan al mismo business_type o sean genéricos
		for _, permission := range permissions {
			// Si el permiso tiene business_type_id, debe coincidir con el del rol
			if permission.BusinessTypeID != nil {
				if *permission.BusinessTypeID != *role.BusinessTypeID {
					roleBTID := uint(0)
					if role.BusinessTypeID != nil {
						roleBTID = *role.BusinessTypeID
					}

					r.logger.Error().
						Uint("role_id", roleID).
						Uint("permission_id", permission.ID).
						Uint("role_business_type", roleBTID).
						Uint("permission_business_type", *permission.BusinessTypeID).
						Msg("El permiso no pertenece al mismo business_type que el rol")
					return fmt.Errorf("el permiso con ID %d no pertenece al mismo business_type que el rol", permission.ID)
				}
			}
			// Si es NULL, es genérico y se puede asignar a cualquier tipo
		}
	}

	// Iniciar transacción
	return db.Transaction(func(tx *gorm.DB) error {
		// Eliminar todos los permisos existentes del rol
		if err := tx.Table("role_permissions").Where("role_id = ?", roleID).Delete(nil).Error; err != nil {
			r.logger.Error().Uint("role_id", roleID).Err(err).Msg("Error al eliminar permisos existentes")
			return err
		}

		// Insertar los nuevos permisos si hay alguno
		if len(permissionIDs) > 0 {
			values := make([]map[string]interface{}, len(permissionIDs))
			for i, permissionID := range permissionIDs {
				values[i] = map[string]interface{}{
					"role_id":       roleID,
					"permission_id": permissionID,
				}
			}

			if err := tx.Table("role_permissions").CreateInBatches(values, 100).Error; err != nil {
				r.logger.Error().
					Uint("role_id", roleID).
					Err(err).
					Msg("Error al insertar permisos")
				return err
			}
		}

		r.logger.Info().
			Uint("role_id", roleID).
			Int("permission_count", len(permissionIDs)).
			Msg("Permisos asignados exitosamente al rol")

		return nil
	})
}

// RemovePermissionFromRole elimina un permiso específico de un rol
func (r *Repository) RemovePermissionFromRole(ctx context.Context, roleID uint, permissionID uint) error {
	db := r.database.Conn(ctx)

	// Verificar que el rol existe
	var role models.Role
	err := db.Where("id = ?", roleID).First(&role).Error
	if err != nil {
		r.logger.Error().Uint("role_id", roleID).Err(err).Msg("Error al encontrar rol")
		return fmt.Errorf("rol no encontrado")
	}

	// Verificar que el permiso existe
	var permission models.Permission
	err = db.Where("id = ?", permissionID).First(&permission).Error
	if err != nil {
		r.logger.Error().Uint("permission_id", permissionID).Err(err).Msg("Error al encontrar permiso")
		return fmt.Errorf("permiso no encontrado")
	}

	// Eliminar la relación
	err = db.Table("role_permissions").
		Where("role_id = ? AND permission_id = ?", roleID, permissionID).
		Delete(nil).Error

	if err != nil {
		r.logger.Error().
			Uint("role_id", roleID).
			Uint("permission_id", permissionID).
			Err(err).
			Msg("Error al eliminar permiso del rol")
		return err
	}

	r.logger.Info().
		Uint("role_id", roleID).
		Uint("permission_id", permissionID).
		Msg("Permiso eliminado exitosamente del rol")

	return nil
}
