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
			CreatedAt:   role.Model.CreatedAt,
			UpdatedAt:   role.Model.UpdatedAt,
		})
	}

	return roles, nil
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
		query = query.Joins("JOIN user_role ON user.id = user_role.user_id").
			Where("user_role.role_id = ?", *filters.RoleID)
	}
	if filters.BusinessID != nil {
		query = query.Joins("JOIN user_business ON user.id = user_business.user_id").
			Where("user_business.business_id = ?", *filters.BusinessID)
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
	var user models.User
	var roles []models.Role

	if err := r.database.Conn(ctx).Model(&models.User{}).Where("id = ?", userID).First(&user).Error; err != nil {
		r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al encontrar usuario")
		return err
	}

	if err := r.database.Conn(ctx).Model(&models.Role{}).Where("id IN ?", roleIDs).Find(&roles).Error; err != nil {
		r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al encontrar roles")
		return err
	}

	if err := r.database.Conn(ctx).Model(&user).Association("Roles").Replace(roles); err != nil {
		r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al asignar roles a usuario")
		return err
	}

	return nil
}

func (r *Repository) AssignBusinessesToUser(ctx context.Context, userID uint, businessIDs []uint) error {
	var user models.User
	var businesses []models.Business

	if err := r.database.Conn(ctx).Model(&models.User{}).Where("id = ?", userID).First(&user).Error; err != nil {
		r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al encontrar usuario")
		return err
	}

	if err := r.database.Conn(ctx).Model(&models.Business{}).Where("id IN ?", businessIDs).Find(&businesses).Error; err != nil {
		r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al encontrar negocios")
		return err
	}

	if err := r.database.Conn(ctx).Model(&user).Association("Businesses").Replace(businesses); err != nil {
		r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al asignar negocios a usuario")
		return err
	}

	return nil
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
