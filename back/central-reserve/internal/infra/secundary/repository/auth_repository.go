package repository

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/domain/entities"
	"central_reserve/internal/infra/secundary/repository/mapper"
	"central_reserve/internal/pkg/apikey"
	"context"
	"dbpostgres/app/infra/models"
	"fmt"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func (r *Repository) GetUserByEmailForAuth(ctx context.Context, email string) (*dtos.UserAuthInfo, error) {
	var userAuth dtos.UserAuthInfo
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

func (r *Repository) GetUserRoles(ctx context.Context, userID uint) ([]entities.Role, error) {
	var user models.User
	var roles []entities.Role

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
		roles = append(roles, entities.Role{
			ID:          role.ID,
			Name:        role.Name,
			Code:        role.Code,
			Description: role.Description,
			Level:       role.Level,
			IsSystem:    role.IsSystem,
			ScopeID:     role.ScopeID,
			CreatedAt:   role.CreatedAt,
			UpdatedAt:   role.UpdatedAt,
		})
	}

	return roles, nil
}

func (r *Repository) GetRolePermissions(ctx context.Context, roleID uint) ([]entities.Permission, error) {
	var role models.Role
	var permissions []entities.Permission

	err := r.database.Conn(ctx).
		Model(&models.Role{}).
		Preload("Permissions.Scope").
		Where("id = ?", roleID).
		First(&role).Error

	if err != nil {
		r.logger.Error().Uint("role_id", roleID).Msg("Error al obtener permisos del rol")
		return nil, err
	}

	for _, permission := range role.Permissions {
		permissions = append(permissions, entities.Permission{
			ID:          permission.ID,
			Name:        permission.Name,
			Code:        permission.Code,
			Description: permission.Description,
			Resource:    permission.Resource,
			Action:      permission.Action,
			ScopeID:     permission.ScopeID,
			CreatedAt:   permission.CreatedAt,
			UpdatedAt:   permission.UpdatedAt,
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

func (r *Repository) GetUserByIDForAuth(ctx context.Context, userID uint) (*dtos.UserAuthInfo, error) {
	var userAuth dtos.UserAuthInfo
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

func (r *Repository) GetUsers(ctx context.Context, filters dtos.UserFilters) ([]dtos.UserQueryDTO, int64, error) {
	var users []dtos.UserQueryDTO
	var total int64

	query := r.database.Conn(ctx).Model(&models.User{})

	if filters.Email != "" {
		query = query.Where("email LIKE ?", "%"+filters.Email+"%")
	}
	if filters.Name != "" {
		query = query.Where("name LIKE ?", "%"+filters.Name+"%")
	}
	if filters.IsActive != nil {
		query = query.Where("is_active = ?", *filters.IsActive)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.Find(&users).Error; err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

func (r *Repository) GetUserBusinesses(ctx context.Context, userID uint) ([]entities.BusinessInfo, error) {
	var user models.User
	var businesses []entities.BusinessInfo

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
		businessInfo := entities.BusinessInfo{
			ID:                 business.ID,
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

func (r *Repository) CreateUser(ctx context.Context, user entities.User) (uint, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		r.logger.Error().Err(err).Msg("Error al hashear contraseña")
		return 0, fmt.Errorf("error al procesar contraseña")
	}
	user.Password = string(hashedPassword)

	// Usar el mapper para convertir entities.User a models.User
	userModel := mapper.CreateUserModel(user)

	if err := r.database.Conn(ctx).Create(&userModel).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al crear usuario")
		return 0, err
	}

	return userModel.ID, nil
}

func (r *Repository) UpdateUser(ctx context.Context, id uint, user entities.User) (string, error) {
	if err := r.database.Conn(ctx).Model(&models.User{}).Where("id = ?", id).Updates(&user).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al actualizar usuario")
		return "", err
	}

	return fmt.Sprintf("Usuario actualizado con ID: %d", id), nil
}

func (r *Repository) DeleteUser(ctx context.Context, id uint) (string, error) {
	if err := r.database.Conn(ctx).Model(&models.User{}).Where("id = ?", id).Delete(&entities.User{}).Error; err != nil {
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

func (r *Repository) GetUserByEmail(ctx context.Context, email string) (*dtos.UserAuthInfo, error) {
	var user dtos.UserAuthInfo
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

func (r *Repository) GetUserByID(ctx context.Context, id uint) (*dtos.UserAuthInfo, error) {
	var user dtos.UserAuthInfo
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

func (r *Repository) CreateAPIKey(ctx context.Context, apiKey entities.APIKey, keyHash string) (uint, error) {
	dbAPIKey := mapper.CreateAPIKeyModel(apiKey, keyHash)

	if err := r.database.Conn(ctx).Model(&models.APIKey{}).Create(&dbAPIKey).Error; err != nil {
		r.logger.Error().Err(err).
			Uint("user_id", apiKey.UserID).
			Uint("business_id", apiKey.BusinessID).
			Msg("Error al crear API Key")
		return 0, err
	}

	return dbAPIKey.ID, nil
}

func (r *Repository) ValidateAPIKey(ctx context.Context, apiKey string) (*entities.APIKey, error) {
	var dbAPIKeys []models.APIKey

	err := r.database.Conn(ctx).
		Model(&models.APIKey{}).
		Where("revoked = ?", false).
		Find(&dbAPIKeys).Error

	if err != nil {
		r.logger.Error().Err(err).Msg("Error al buscar API Keys")
		return nil, err
	}

	apiKeyService := apikey.NewService()
	for _, dbAPIKey := range dbAPIKeys {
		if apiKeyService.ValidateAPIKey(apiKey, dbAPIKey.KeyHash) {
			if err := r.UpdateAPIKeyLastUsed(ctx, dbAPIKey.ID); err != nil {
				r.logger.Warn().Uint("api_key_id", dbAPIKey.ID).Err(err).Msg("Error al actualizar último uso")
			}

			entity := mapper.ToAPIKeyEntity(dbAPIKey)
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

func (r *Repository) GetAPIKeysByUser(ctx context.Context, userID uint) ([]entities.APIKeyInfo, error) {
	var dbAPIKeys []models.APIKey

	err := r.database.Conn(ctx).
		Model(&models.APIKey{}).
		Where("user_id = ?", userID).
		Find(&dbAPIKeys).Error

	if err != nil {
		r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al obtener API Keys del usuario")
		return nil, err
	}

	apiKeys := mapper.ToAPIKeyInfoEntitySlice(dbAPIKeys)
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
