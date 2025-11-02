package repository

import (
	"central_reserve/services/auth/internal/domain"
	"central_reserve/services/auth/internal/infra/secondary/repository/mappers"
	"context"
	"dbpostgres/app/infra/models"
	"fmt"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func (r *Repository) GetUserByEmailForAuth(ctx context.Context, email string) (*domain.UserAuthInfo, error) {
	var userAuth domain.UserAuthInfo
	if err := r.database.Conn(ctx).
		Model(&models.User{}).
		Select("id, name, email, password, phone, avatar_url, is_active, last_login_at, created_at, updated_at, deleted_at").
		Where("email = ?", email).
		First(&userAuth).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		r.logger.Error().Str("email", email).Err(err).Msg("Error al obtener usuario por email")
		return nil, err
	}
	return &userAuth, nil
}

func (r *Repository) GetUserRoles(ctx context.Context, userID uint) ([]domain.Role, error) {
	var user models.User
	var roles []domain.Role

	err := r.database.Conn(ctx).
		Model(&models.User{}).
		Preload("Roles.Scope").
		Where("id = ?", userID).
		First(&user).Error

	if err != nil {
		r.logger.Error().Uint("user_id", userID).Msg("Error al obtener roles del usuario")
		return nil, err
	}

	for _, role := range user.Roles {
		roles = append(roles, domain.Role{
			ID:          role.Model.ID,
			Name:        role.Name,
			Description: role.Description,
			Level:       role.Level,
			IsSystem:    role.IsSystem,
			ScopeID:     role.ScopeID,
			ScopeName:   role.Scope.Name,
			ScopeCode:   role.Scope.Code,
			CreatedAt:   role.Model.CreatedAt,
			UpdatedAt:   role.Model.UpdatedAt,
		})
	}

	return roles, nil
}

// GetUserRoleByBusiness obtiene el rol de un usuario para un business específico desde user_roles
// Valida que el rol coincida con el tipo de business
func (r *Repository) GetUserRoleByBusiness(ctx context.Context, userID uint, businessID uint) (*domain.Role, error) {
	// Obtener el business para conocer su tipo
	var business models.Business
	if err := r.database.Conn(ctx).
		Preload("BusinessType").
		Where("id = ?", businessID).
		First(&business).Error; err != nil {
		r.logger.Error().
			Uint("business_id", businessID).
			Err(err).
			Msg("Error al obtener business para validar tipo")
		return nil, err
	}

	// Buscar roles del usuario que coincidan con el tipo de business
	var userRoles []models.Role
	err := r.database.Conn(ctx).
		Preload("Scope").
		Preload("BusinessType").
		Joins("JOIN user_roles ON user_roles.role_id = role.id").
		Where("user_roles.user_id = ? AND (role.business_type_id = ? OR role.business_type_id IS NULL)", userID, business.BusinessTypeID).
		Find(&userRoles).Error

	if err != nil {
		r.logger.Error().
			Uint("user_id", userID).
			Uint("business_id", businessID).
			Err(err).
			Msg("Error al obtener roles del usuario desde user_roles")
		return nil, err
	}

	if len(userRoles) == 0 {
		return nil, nil // No tiene roles válidos para este tipo de business
	}

	// Tomar el primer rol válido (priorizar roles específicos del tipo de business)
	var selectedRole models.Role
	for _, role := range userRoles {
		if role.BusinessTypeID != nil && *role.BusinessTypeID == business.BusinessTypeID {
			selectedRole = role
			break
		}
	}

	// Si no hay rol específico, tomar el primero
	if selectedRole.ID == 0 && len(userRoles) > 0 {
		selectedRole = userRoles[0]
	}

	if selectedRole.ID == 0 {
		return nil, nil
	}

	businessTypeID := uint(0)
	businessTypeName := ""
	if selectedRole.BusinessTypeID != nil {
		businessTypeID = *selectedRole.BusinessTypeID
	}
	if selectedRole.BusinessType != nil {
		businessTypeName = selectedRole.BusinessType.Name
	}

	role := &domain.Role{
		ID:               selectedRole.ID,
		Name:             selectedRole.Name,
		Description:      selectedRole.Description,
		Level:            selectedRole.Level,
		IsSystem:         selectedRole.IsSystem,
		ScopeID:          selectedRole.ScopeID,
		ScopeName:        selectedRole.Scope.Name,
		ScopeCode:        selectedRole.Scope.Code,
		BusinessTypeID:   businessTypeID,
		BusinessTypeName: businessTypeName,
		CreatedAt:        selectedRole.CreatedAt,
		UpdatedAt:        selectedRole.UpdatedAt,
	}

	return role, nil
}

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
		permissions = append(permissions, domain.Permission{
			ID:          permission.Model.ID,
			Description: permission.Resource.Description,
			Resource:    permission.Resource.Name,
			Action:      permission.Action.Name,
		})
	}

	return permissions, nil
}

func (r *Repository) UpdateLastLogin(ctx context.Context, userID uint) error {
	now := time.Now()
	if err := r.database.Conn(ctx).Table("user").Where("id = ?", userID).Update("last_login_at", now).Error; err != nil {
		r.logger.Error().Uint("user_id", userID).Msg("Error al actualizar último login")
		return err
	}
	return nil
}

func (r *Repository) GetUserByIDForAuth(ctx context.Context, userID uint) (*domain.UserAuthInfo, error) {
	var userAuth domain.UserAuthInfo
	if err := r.database.Conn(ctx).
		Model(&models.User{}).
		Select("id, name, email, password, phone, avatar_url, is_active, last_login_at, created_at, updated_at, deleted_at").
		Where("id = ?", userID).
		First(&userAuth).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al obtener usuario por ID")
		return nil, err
	}
	return &userAuth, nil
}

func (r *Repository) ChangePassword(ctx context.Context, userID uint, newPassword string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		r.logger.Error().Err(err).Msg("Error al hashear nueva contraseña")
		return fmt.Errorf("error al procesar contraseña")
	}

	if err := r.database.Conn(ctx).
		Model(&models.User{}).
		Where("id = ?", userID).
		Update("password", string(hashedPassword)).Error; err != nil {
		r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al actualizar contraseña")
		return err
	}

	return nil
}

func (r *Repository) GetUsers(ctx context.Context, filters domain.UserFilters) ([]domain.UserQueryDTO, int64, error) {
	var users []domain.UserQueryDTO
	var total int64

	query := r.database.Conn(ctx).Model(&models.User{})

	// Filtros
	if filters.Email != "" {
		query = query.Where("email LIKE ?", "%"+filters.Email+"%")
	}
	if filters.Name != "" {
		query = query.Where("name LIKE ?", "%"+filters.Name+"%")
	}
	if filters.Phone != "" {
		query = query.Where("phone LIKE ?", "%"+filters.Phone+"%")
	}
	if len(filters.UserIDs) > 0 {
		query = query.Where("id IN ?", filters.UserIDs)
	}
	if filters.IsActive != nil {
		query = query.Where("is_active = ?", *filters.IsActive)
	}
	if filters.RoleID != nil {
		// Subquery para obtener IDs de usuarios con el rol especificado
		subquery := r.database.Conn(ctx).
			Table("user_roles").
			Select("user_id").
			Where("role_id = ?", *filters.RoleID)
		query = query.Where("id IN (?)", subquery)
	}
	if filters.BusinessID != nil {
		// Subquery para obtener IDs de usuarios con el business especificado
		subquery := r.database.Conn(ctx).
			Table("user_businesses").
			Select("user_id").
			Where("business_id = ?", *filters.BusinessID)
		query = query.Where("id IN (?)", subquery)
	}

	// Ordenamiento
	if filters.SortBy != "" && filters.SortOrder != "" {
		orderClause := filters.SortBy + " " + filters.SortOrder
		query = query.Order(orderClause)
	} else {
		query = query.Order("created_at desc") // Por defecto
	}

	// Contar total
	if err := query.Count(&total).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al contar usuarios")
		return nil, 0, err
	}

	// Paginación
	offset := (filters.Page - 1) * filters.PageSize
	query = query.Offset(offset).Limit(filters.PageSize)

	if err := query.Find(&users).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al obtener usuarios")
		return nil, 0, err
	}

	return users, total, nil
}

func (r *Repository) GetUserBusinesses(ctx context.Context, userID uint) ([]domain.BusinessInfoEntity, error) {
	var user models.User
	var businesses []domain.BusinessInfoEntity

	err := r.database.Conn(ctx).
		Model(&models.User{}).
		Preload("Businesses.BusinessType").
		Where("id = ?", userID).
		First(&user).Error

	if err != nil {
		r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al obtener negocios del usuario")
		return nil, err
	}

	for _, business := range user.Businesses {
		businessInfo := domain.BusinessInfoEntity{
			ID:                 business.Model.ID,
			Name:               business.Name,
			Code:               business.Code,
			BusinessTypeID:     business.BusinessTypeID,
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
			IsActive:           business.IsActive,
			EnableDelivery:     business.EnableDelivery,
			EnablePickup:       business.EnablePickup,
			EnableReservations: business.EnableReservations,
		}

		if business.BusinessType.ID != 0 {
			businessInfo.BusinessTypeName = business.BusinessType.Name
			businessInfo.BusinessTypeCode = business.BusinessType.Code
		}

		businesses = append(businesses, businessInfo)
	}

	return businesses, nil
}

func (r *Repository) CreateUser(ctx context.Context, user domain.UsersEntity) (uint, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		r.logger.Error().Err(err).Msg("Error al hashear contraseña")
		return 0, fmt.Errorf("error al procesar contraseña")
	}
	user.Password = string(hashedPassword)

	// Usar el mapper para convertir entities.User a models.User
	userModel := mappers.CreateUserModel(user)

	if err := r.database.Conn(ctx).Create(&userModel).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al crear usuario")
		return 0, err
	}

	return userModel.Model.ID, nil
}

func (r *Repository) UpdateUser(ctx context.Context, id uint, user domain.UsersEntity) (string, error) {
	if err := r.database.Conn(ctx).Model(&models.User{}).Where("id = ?", id).Updates(&user).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al actualizar usuario")
		return "", err
	}

	return fmt.Sprintf("Usuario actualizado con ID: %d", id), nil
}

func (r *Repository) DeleteUser(ctx context.Context, id uint) (string, error) {
	if err := r.database.Conn(ctx).Delete(&models.User{}, id).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al eliminar usuario")
		return "", err
	}

	return fmt.Sprintf("Usuario eliminado con ID: %d", id), nil
}

func (r *Repository) AssignRolesToUser(ctx context.Context, userID uint, roleIDs []uint) error {
	db := r.database.Conn(ctx)

	// Verificar que el usuario existe
	var user models.User
	if err := db.Where("id = ?", userID).First(&user).Error; err != nil {
		r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al encontrar usuario")
		return err
	}

	// Verificar que los roles existen
	if len(roleIDs) > 0 {
		var count int64
		if err := db.Model(&models.Role{}).Where("id IN ?", roleIDs).Count(&count).Error; err != nil {
			r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al verificar roles")
			return err
		}
		if count != int64(len(roleIDs)) {
			r.logger.Error().
				Uint("user_id", userID).
				Int64("expected", int64(len(roleIDs))).
				Int64("found", count).
				Msg("Algunos roles no existen")
			return fmt.Errorf("algunos roles no existen")
		}
	}

	// Iniciar transacción
	return db.Transaction(func(tx *gorm.DB) error {
		// Eliminar todos los roles existentes
		if err := tx.Table("user_roles").Where("user_id = ?", userID).Delete(nil).Error; err != nil {
			r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al eliminar roles existentes")
			return err
		}

		// Insertar los nuevos roles si hay alguno
		if len(roleIDs) > 0 {
			values := make([]map[string]interface{}, len(roleIDs))
			for i, roleID := range roleIDs {
				values[i] = map[string]interface{}{
					"user_id": userID,
					"role_id": roleID,
				}
			}

			if err := tx.Table("user_roles").CreateInBatches(values, 100).Error; err != nil {
				r.logger.Error().
					Uint("user_id", userID).
					Err(err).
					Msg("Error al insertar roles")
				return err
			}
		}

		r.logger.Info().
			Uint("user_id", userID).
			Int("role_count", len(roleIDs)).
			Msg("Roles asignados exitosamente")

		return nil
	})
}

func (r *Repository) AssignBusinessesToUser(ctx context.Context, userID uint, businessIDs []uint) error {
	db := r.database.Conn(ctx)

	// Verificar que el usuario existe
	var user models.User
	if err := db.Where("id = ?", userID).First(&user).Error; err != nil {
		r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al encontrar usuario")
		return err
	}

	// Verificar que los businesses existen
	if len(businessIDs) > 0 {
		var count int64
		if err := db.Model(&models.Business{}).Where("id IN ?", businessIDs).Count(&count).Error; err != nil {
			r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al verificar businesses")
			return err
		}
		if count != int64(len(businessIDs)) {
			r.logger.Error().
				Uint("user_id", userID).
				Int64("expected", int64(len(businessIDs))).
				Int64("found", count).
				Msg("Algunos businesses no existen")
			return fmt.Errorf("algunos businesses no existen")
		}
	}

	// Iniciar transacción
	return db.Transaction(func(tx *gorm.DB) error {
		// Eliminar todos los businesses existentes
		if err := tx.Table("user_businesses").Where("user_id = ?", userID).Delete(nil).Error; err != nil {
			r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al eliminar businesses existentes")
			return err
		}

		// Insertar los nuevos businesses si hay alguno
		if len(businessIDs) > 0 {
			values := make([]map[string]interface{}, len(businessIDs))
			for i, businessID := range businessIDs {
				values[i] = map[string]interface{}{
					"user_id":     userID,
					"business_id": businessID,
				}
			}

			if err := tx.Table("user_businesses").CreateInBatches(values, 100).Error; err != nil {
				r.logger.Error().
					Uint("user_id", userID).
					Err(err).
					Msg("Error al insertar businesses")
				return err
			}
		}

		r.logger.Info().
			Uint("user_id", userID).
			Int("business_count", len(businessIDs)).
			Msg("Businesses asignados exitosamente")

		return nil
	})
}

func (r *Repository) GetUserByEmail(ctx context.Context, email string) (*domain.UserAuthInfo, error) {
	var user domain.UserAuthInfo
	if err := r.database.Conn(ctx).
		Model(&models.User{}).
		Where("email = ?", email).
		First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		r.logger.Error().Str("email", email).Err(err).Msg("Error al obtener usuario por email")
		return nil, err
	}
	return &user, nil
}

func (r *Repository) GetUserByID(ctx context.Context, id uint) (*domain.UserAuthInfo, error) {
	var user domain.UserAuthInfo
	if err := r.database.Conn(ctx).
		Model(&models.User{}).
		Where("id = ?", id).
		First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al obtener usuario por ID")
		return nil, err
	}
	return &user, nil
}

func (r *Repository) CreateAPIKey(ctx context.Context, apiKey domain.APIKey, keyHash string) (uint, error) {
	dbAPIKey := mappers.CreateAPIKeyModel(apiKey, keyHash)

	if err := r.database.Conn(ctx).Model(&models.APIKey{}).Create(&dbAPIKey).Error; err != nil {
		r.logger.Error().Err(err).
			Uint("user_id", apiKey.UserID).
			Uint("business_id", apiKey.BusinessID).
			Msg("Error al crear API Key")
		return 0, err
	}

	return dbAPIKey.Model.ID, nil
}

func (r *Repository) ValidateAPIKey(ctx context.Context, apiKey string) (*domain.APIKey, error) {
	var dbAPIKeys []models.APIKey

	err := r.database.Conn(ctx).
		Model(&models.APIKey{}).
		Where("revoked = ?", false).
		Find(&dbAPIKeys).Error

	if err != nil {
		r.logger.Error().Err(err).Msg("Error al buscar API Keys")
		return nil, err
	}

	for _, dbAPIKey := range dbAPIKeys {
		if apiKey == dbAPIKey.KeyHash {
			if err := r.UpdateAPIKeyLastUsed(ctx, dbAPIKey.Model.ID); err != nil {
				r.logger.Warn().Uint("api_key_id", dbAPIKey.Model.ID).Err(err).Msg("Error al actualizar último uso")
			}

			entity := mappers.ToAPIKeyEntity(dbAPIKey)
			return &entity, nil
		}
	}

	return nil, nil
}

func (r *Repository) UpdateAPIKeyLastUsed(ctx context.Context, apiKeyID uint) error {
	now := time.Now()
	if err := r.database.Conn(ctx).
		Model(&models.APIKey{}).
		Where("id = ?", apiKeyID).
		Update("last_used_at", now).Error; err != nil {
		r.logger.Error().Uint("api_key_id", apiKeyID).Err(err).Msg("Error al actualizar último uso de API Key")
		return err
	}

	return nil
}

func (r *Repository) GetAPIKeysByUser(ctx context.Context, userID uint) ([]domain.APIKeyInfo, error) {
	var dbAPIKeys []models.APIKey

	err := r.database.Conn(ctx).
		Model(&models.APIKey{}).
		Where("user_id = ?", userID).
		Find(&dbAPIKeys).Error

	if err != nil {
		r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al obtener API Keys del usuario")
		return nil, err
	}

	apiKeys := mappers.ToAPIKeyInfoEntitySlice(dbAPIKeys)
	return apiKeys, nil
}

func (r *Repository) RevokeAPIKey(ctx context.Context, apiKeyID uint) error {
	now := time.Now()
	if err := r.database.Conn(ctx).
		Model(&models.APIKey{}).
		Where("id = ?", apiKeyID).
		Updates(map[string]interface{}{
			"revoked":    true,
			"revoked_at": now,
			"updated_at": now,
		}).Error; err != nil {
		return err
	}
	return nil
}

// GetBusinessConfiguredResourcesIDs obtiene los IDs de recursos configurados para un business específico
func (r *Repository) GetBusinessConfiguredResourcesIDs(ctx context.Context, businessID uint) ([]uint, error) {
	var resourcesIDs []uint

	// Obtener business_type_resource_permitted_id configurados
	err := r.database.Conn(ctx).
		Table("business_resource_configured").
		Where("business_id = ? AND deleted_at IS NULL", businessID).
		Pluck("business_type_resource_permitted_id", &resourcesIDs).Error

	if err != nil {
		r.logger.Error().Err(err).Uint("business_id", businessID).Msg("Error al obtener recursos configurados del business")
		return nil, err
	}

	// Si no hay recursos configurados, retornar slice vacío
	if len(resourcesIDs) == 0 {
		return []uint{}, nil
	}

	// Obtener los resource_ids desde business_type_resource_permitted
	var actualResourceIDs []uint
	err = r.database.Conn(ctx).
		Table("business_type_resource_permitted").
		Where("id IN ? AND deleted_at IS NULL", resourcesIDs).
		Pluck("resource_id", &actualResourceIDs).Error

	if err != nil {
		r.logger.Error().Err(err).Uint("business_id", businessID).Msg("Error al obtener resource_ids")
		return nil, err
	}

	r.logger.Info().Uint("business_id", businessID).Int("resources_count", len(actualResourceIDs)).Msg("Recursos configurados del business obtenidos exitosamente")

	return actualResourceIDs, nil
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
					"created_at":    time.Now(),
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

// GetRolePermissionsIDs obtiene los IDs de los permisos asignados a un rol
func (r *Repository) GetRolePermissionsIDs(ctx context.Context, roleID uint) ([]uint, error) {
	db := r.database.Conn(ctx)

	// Verificar que el rol existe
	var role models.Role
	err := db.Where("id = ?", roleID).First(&role).Error
	if err != nil {
		r.logger.Error().Uint("role_id", roleID).Err(err).Msg("Error al encontrar rol")
		return nil, fmt.Errorf("rol no encontrado")
	}

	var permissionIDs []uint
	err = db.Table("role_permissions").
		Where("role_id = ?", roleID).
		Pluck("permission_id", &permissionIDs).Error

	if err != nil {
		r.logger.Error().Uint("role_id", roleID).Err(err).Msg("Error al obtener permisos del rol")
		return nil, err
	}

	r.logger.Info().
		Uint("role_id", roleID).
		Int("permission_count", len(permissionIDs)).
		Msg("IDs de permisos del rol obtenidos exitosamente")

	return permissionIDs, nil
}
