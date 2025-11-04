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
		businessTypeID := uint(0)
		if permission.BusinessTypeID != nil {
			businessTypeID = *permission.BusinessTypeID
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
			BusinessTypeID:   businessTypeID,
			BusinessTypeName: "", // Se puede agregar si se necesita
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
	// Obtener relaciones business_staff con preload de Business y Role
	var businessStaffList []models.BusinessStaff

	if err := r.database.Conn(ctx).
		Preload("Business.BusinessType").
		Preload("Role").
		Where("user_id = ? AND business_id IS NOT NULL", userID).
		Find(&businessStaffList).Error; err != nil {
		r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al obtener negocios del usuario desde business_staff")
		return nil, err
	}

	result := make([]domain.BusinessInfoEntity, 0, len(businessStaffList))
	for _, bs := range businessStaffList {
		if bs.BusinessID == nil || bs.Business.ID == 0 {
			continue // Saltar si no hay business
		}

		businessInfo := domain.BusinessInfoEntity{
			ID:                 bs.Business.ID,
			Name:               bs.Business.Name,
			Code:               bs.Business.Code,
			BusinessTypeID:     bs.Business.BusinessTypeID,
			Timezone:           bs.Business.Timezone,
			Address:            bs.Business.Address,
			Description:        bs.Business.Description,
			LogoURL:            bs.Business.LogoURL,
			PrimaryColor:       bs.Business.PrimaryColor,
			SecondaryColor:     bs.Business.SecondaryColor,
			TertiaryColor:      bs.Business.TertiaryColor,
			QuaternaryColor:    bs.Business.QuaternaryColor,
			NavbarImageURL:     bs.Business.NavbarImageURL,
			CustomDomain:       bs.Business.CustomDomain,
			IsActive:           bs.Business.IsActive,
			EnableDelivery:     bs.Business.EnableDelivery,
			EnablePickup:       bs.Business.EnablePickup,
			EnableReservations: bs.Business.EnableReservations,
		}

		if bs.Business.BusinessType.ID != 0 {
			businessInfo.BusinessTypeName = bs.Business.BusinessType.Name
			businessInfo.BusinessTypeCode = bs.Business.BusinessType.Code
		}

		result = append(result, businessInfo)
	}

	return result, nil
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

	// Iniciar transacción sobre business_staff (única fuente de verdad)
	return db.Transaction(func(tx *gorm.DB) error {
		// Obtener relaciones existentes para este usuario (incluyendo soft deleted)
		var existingRecords []models.BusinessStaff
		if err := tx.Unscoped().Where("user_id = ? AND business_id IS NOT NULL", userID).Find(&existingRecords).Error; err != nil {
			r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al obtener relaciones business_staff existentes")
			return err
		}

		// Crear mapa de business_ids existentes
		existingBusinessMap := make(map[uint]bool)
		existingRecordMap := make(map[uint]*models.BusinessStaff)
		for i := range existingRecords {
			if existingRecords[i].BusinessID != nil {
				bid := *existingRecords[i].BusinessID
				existingBusinessMap[bid] = true
				existingRecordMap[bid] = &existingRecords[i]
			}
		}

		// Crear mapa de business_ids nuevos
		newBusinessMap := make(map[uint]bool)
		for _, bid := range businessIDs {
			newBusinessMap[bid] = true
		}

		// Hard delete de relaciones que ya no están en la nueva lista
		for bid := range existingBusinessMap {
			if !newBusinessMap[bid] {
				if err := tx.Unscoped().Where("user_id = ? AND business_id = ?", userID, bid).Delete(&models.BusinessStaff{}).Error; err != nil {
					r.logger.Error().Uint("user_id", userID).Uint("business_id", bid).Err(err).Msg("Error al eliminar relación business_staff")
					return err
				}
			}
		}

		// Insertar o actualizar relaciones
		if len(businessIDs) > 0 {
			for _, bid := range businessIDs {
				if existingRecord, exists := existingRecordMap[bid]; exists {
					// Actualizar registro existente (restaurar si estaba soft deleted y actualizar role_id a NULL)
					if err := tx.Unscoped().Model(existingRecord).
						Updates(map[string]interface{}{
							"deleted_at": nil,
							"role_id":    nil,
						}).Error; err != nil {
						r.logger.Error().Uint("user_id", userID).Uint("business_id", bid).Err(err).Msg("Error al actualizar relación business_staff")
						return err
					}
				} else {
					// Insertar nuevo registro
					b := bid
					newRecord := models.BusinessStaff{
						UserID:     userID,
						BusinessID: &b,
						RoleID:     nil,
					}
					if err := tx.Create(&newRecord).Error; err != nil {
						r.logger.Error().Uint("user_id", userID).Uint("business_id", bid).Err(err).Msg("Error al insertar relación business_staff")
						return err
					}
				}
			}
		}

		r.logger.Info().
			Uint("user_id", userID).
			Int("business_count", len(businessIDs)).
			Msg("Relaciones business_staff actualizadas (sin rol)")

		return nil
	})
}

// AssignBusinessStaffRelationships asigna relaciones usuario-negocio-rol usando la tabla business_staff
func (r *Repository) AssignBusinessStaffRelationships(ctx context.Context, userID uint, assignments []domain.BusinessRoleAssignment) error {
	db := r.database.Conn(ctx)

	// Verificar que el usuario existe
	var user models.User
	if err := db.Where("id = ?", userID).First(&user).Error; err != nil {
		r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al encontrar usuario")
		return err
	}

	// Validar que todos los businesses y roles existen
	if len(assignments) > 0 {
		// Construir listas de IDs únicos para validaciones
		businessSet := make(map[uint]struct{})
		roleSet := make(map[uint]struct{})
		for _, assignment := range assignments {
			businessSet[assignment.BusinessID] = struct{}{}
			roleSet[assignment.RoleID] = struct{}{}
		}
		uniqueBusinessIDs := make([]uint, 0, len(businessSet))
		for id := range businessSet {
			uniqueBusinessIDs = append(uniqueBusinessIDs, id)
		}
		uniqueRoleIDs := make([]uint, 0, len(roleSet))
		for id := range roleSet {
			uniqueRoleIDs = append(uniqueRoleIDs, id)
		}

		// Verificar businesses (únicos)
		var businessCount int64
		if err := db.Model(&models.Business{}).Where("id IN ?", uniqueBusinessIDs).Count(&businessCount).Error; err != nil {
			r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al verificar businesses")
			return err
		}
		if businessCount != int64(len(uniqueBusinessIDs)) {
			r.logger.Error().
				Uint("user_id", userID).
				Int64("expected", int64(len(uniqueBusinessIDs))).
				Int64("found", businessCount).
				Msg("Algunos businesses no existen")
			return fmt.Errorf("algunos businesses no existen")
		}

		// Verificar roles (únicos)
		var roleCount int64
		if err := db.Model(&models.Role{}).Where("id IN ?", uniqueRoleIDs).Count(&roleCount).Error; err != nil {
			r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al verificar roles")
			return err
		}
		if roleCount != int64(len(uniqueRoleIDs)) {
			r.logger.Error().
				Uint("user_id", userID).
				Int64("expected", int64(len(uniqueRoleIDs))).
				Int64("found", roleCount).
				Msg("Algunos roles no existen")
			return fmt.Errorf("algunos roles no existen")
		}
	}

	// Iniciar transacción
	return db.Transaction(func(tx *gorm.DB) error {
		// Eliminar todas las relaciones business_staff existentes para este usuario
		if err := tx.Table("business_staff").Where("user_id = ?", userID).Delete(nil).Error; err != nil {
			r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al eliminar relaciones business_staff existentes")
			return err
		}

		// Eliminar relaciones en user_businesses y user_roles para mantener consistencia
		if err := tx.Table("user_businesses").Where("user_id = ?", userID).Delete(nil).Error; err != nil {
			r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al eliminar relaciones user_businesses")
			return err
		}

		if err := tx.Table("user_roles").Where("user_id = ?", userID).Delete(nil).Error; err != nil {
			r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al eliminar relaciones user_roles")
			return err
		}

		// Insertar las nuevas relaciones business_staff
		if len(assignments) > 0 {
			businessStaffRecords := make([]models.BusinessStaff, len(assignments))
			businessSet := make(map[uint]bool)
			roleSet := make(map[uint]bool)

			for i, assignment := range assignments {
				rid := assignment.RoleID
				bid := assignment.BusinessID
				businessStaffRecords[i] = models.BusinessStaff{
					UserID:     userID,
					BusinessID: &bid,
					RoleID:     &rid,
				}
				businessSet[assignment.BusinessID] = true
				roleSet[assignment.RoleID] = true
			}

			if err := tx.CreateInBatches(businessStaffRecords, 100).Error; err != nil {
				r.logger.Error().
					Uint("user_id", userID).
					Err(err).
					Msg("Error al insertar relaciones business_staff")
				return err
			}

			// También mantener las relaciones many-to-many para compatibilidad
			// Insertar en user_businesses
			for businessID := range businessSet {
				if err := tx.Table("user_businesses").Create(map[string]interface{}{
					"user_id":     userID,
					"business_id": businessID,
				}).Error; err != nil {
					r.logger.Warn().Uint("user_id", userID).Uint("business_id", businessID).Err(err).Msg("Error al insertar en user_businesses (no crítico)")
				}
			}

			// Insertar en user_roles
			for roleID := range roleSet {
				if err := tx.Table("user_roles").Create(map[string]interface{}{
					"user_id": userID,
					"role_id": roleID,
				}).Error; err != nil {
					r.logger.Warn().Uint("user_id", userID).Uint("role_id", roleID).Err(err).Msg("Error al insertar en user_roles (no crítico)")
				}
			}
		}

		r.logger.Info().
			Uint("user_id", userID).
			Int("assignments_count", len(assignments)).
			Msg("Relaciones business_staff asignadas exitosamente")

		return nil
	})
}

// GetBusinessStaffRelationships obtiene todas las relaciones business_staff de un usuario con información completa
func (r *Repository) GetBusinessStaffRelationships(ctx context.Context, userID uint) ([]domain.BusinessRoleAssignmentDetailed, error) {
	var businessStaffList []models.BusinessStaff

	err := r.database.Conn(ctx).
		Preload("Business.BusinessType").
		Preload("Role").
		Where("user_id = ? AND deleted_at IS NULL", userID).
		Find(&businessStaffList).Error

	if err != nil {
		r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al obtener relaciones business_staff")
		return nil, err
	}

	r.logger.Info().
		Uint("user_id", userID).
		Int("business_staff_count", len(businessStaffList)).
		Msg("Relaciones business_staff obtenidas")

	assignments := make([]domain.BusinessRoleAssignmentDetailed, 0, len(businessStaffList))
	for _, bs := range businessStaffList {
		businessName := ""
		var businessID uint
		if bs.BusinessID != nil {
			businessID = *bs.BusinessID
			if bs.Business.ID != 0 {
				businessName = bs.Business.Name
			}
		}

		var roleID uint
		roleName := ""
		if bs.RoleID != nil {
			roleID = *bs.RoleID
			r.logger.Debug().
				Uint("user_id", userID).
				Uint("business_id", businessID).
				Uint("role_id", roleID).
				Bool("role_loaded", bs.Role.ID != 0).
				Uint("role_model_id", bs.Role.ID).
				Msg("Verificando carga del rol")

			// Verificar si el Role fue cargado correctamente desde preload
			if bs.Role.ID != 0 && bs.Role.ID == roleID {
				roleName = bs.Role.Name
				r.logger.Debug().
					Uint("user_id", userID).
					Uint("business_id", businessID).
					Uint("role_id", roleID).
					Str("role_name", roleName).
					Msg("Rol cargado correctamente desde preload")
			} else {
				// Si el preload no funcionó, consultar el rol manualmente
				r.logger.Warn().
					Uint("user_id", userID).
					Uint("business_id", businessID).
					Uint("role_id", roleID).
					Uint("role_model_id", bs.Role.ID).
					Msg("El rol no fue cargado desde preload, consultando manualmente")

				var role models.Role
				if err := r.database.Conn(ctx).Where("id = ?", roleID).First(&role).Error; err == nil && role.ID != 0 {
					roleName = role.Name
					r.logger.Info().
						Uint("user_id", userID).
						Uint("business_id", businessID).
						Uint("role_id", roleID).
						Str("role_name", roleName).
						Msg("Rol obtenido manualmente")
				} else {
					r.logger.Error().
						Uint("user_id", userID).
						Uint("business_id", businessID).
						Uint("role_id", roleID).
						Err(err).
						Msg("Error al consultar rol manualmente")
				}
			}
		} else {
			r.logger.Debug().
				Uint("user_id", userID).
				Uint("business_id", businessID).
				Msg("No hay role_id asignado en business_staff")
		}

		assignments = append(assignments, domain.BusinessRoleAssignmentDetailed{
			BusinessID:   businessID,
			BusinessName: businessName,
			RoleID:       roleID,
			RoleName:     roleName,
		})
	}

	r.logger.Info().
		Uint("user_id", userID).
		Int("assignments_count", len(assignments)).
		Msg("Assignments construidos desde business_staff")

	return assignments, nil
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

// GetBusinessConfiguredResourcesIDs obtiene los IDs de recursos ACTIVOS configurados para un business específico
func (r *Repository) GetBusinessConfiguredResourcesIDs(ctx context.Context, businessID uint) ([]uint, error) {
	var resourcesIDs []uint

	// Obtener solo los resource_ids que están activos (active = true) en business_resource_configured
	err := r.database.Conn(ctx).
		Model(&models.BusinessResourceConfigured{}).
		Where("business_id = ? AND active = ? AND deleted_at IS NULL", businessID, true).
		Pluck("resource_id", &resourcesIDs).Error

	if err != nil {
		r.logger.Error().Err(err).Uint("business_id", businessID).Msg("Error al obtener recursos activos configurados del business")
		return nil, err
	}

	r.logger.Info().Uint("business_id", businessID).Int("resources_count", len(resourcesIDs)).Msg("Recursos activos configurados del business obtenidos exitosamente")

	return resourcesIDs, nil
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

// GetUserRoleIDFromBusinessStaff retorna el role_id de business_staff para un usuario y business dado
// Si businessID es nil, busca filas con business_id NULL (caso super)
func (r *Repository) GetUserRoleIDFromBusinessStaff(ctx context.Context, userID uint, businessID *uint) (*uint, error) {
	db := r.database.Conn(ctx)
	var bs models.BusinessStaff
	q := db.Where("user_id = ?", userID)
	if businessID == nil {
		q = q.Where("business_id IS NULL")
	} else {
		q = q.Where("business_id = ?", *businessID)
	}
	if err := q.First(&bs).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error consultando business_staff")
		return nil, err
	}
	return bs.RoleID, nil
}

// GetBusinessStaffRelation obtiene la relación completa user-business-role desde business_staff
func (r *Repository) GetBusinessStaffRelation(ctx context.Context, userID uint, businessID *uint) (*domain.BusinessStaffRelation, error) {
	db := r.database.Conn(ctx)
	var bs models.BusinessStaff
	q := db.Where("user_id = ?", userID)
	if businessID == nil {
		q = q.Where("business_id IS NULL")
		r.logger.Info().Uint("user_id", userID).Msg("Buscando relación con business_id NULL")
	} else {
		q = q.Where("business_id = ?", *businessID)
		r.logger.Info().Uint("user_id", userID).Uint("business_id", *businessID).Msg("Buscando relación con business_id específico")
	}

	// Preload de Business (si existe) y Role (si existe)
	if err := q.Preload("Business.BusinessType").Preload("Role").First(&bs).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			r.logger.Warn().Uint("user_id", userID).Any("business_id", businessID).Msg("Relación no encontrada en business_staff")
			return nil, nil
		}
		r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error consultando business_staff")
		return nil, err
	}

	r.logger.Info().
		Uint("user_id", bs.UserID).
		Any("business_id", bs.BusinessID).
		Any("role_id", bs.RoleID).
		Bool("has_business", bs.Business.ID != 0).
		Bool("has_role", bs.Role.ID != 0).
		Msg("Relación business_staff encontrada")

	rel := &domain.BusinessStaffRelation{
		UserID:     bs.UserID,
		BusinessID: bs.BusinessID,
		RoleID:     bs.RoleID,
	}

	// Si hay business, mapear la información
	if bs.BusinessID != nil && bs.Business.ID != 0 {
		businessInfo := domain.BusinessInfoEntity{
			ID:                 bs.Business.ID,
			Name:               bs.Business.Name,
			Code:               bs.Business.Code,
			BusinessTypeID:     bs.Business.BusinessTypeID,
			Timezone:           bs.Business.Timezone,
			Address:            bs.Business.Address,
			Description:        bs.Business.Description,
			LogoURL:            bs.Business.LogoURL,
			PrimaryColor:       bs.Business.PrimaryColor,
			SecondaryColor:     bs.Business.SecondaryColor,
			TertiaryColor:      bs.Business.TertiaryColor,
			QuaternaryColor:    bs.Business.QuaternaryColor,
			NavbarImageURL:     bs.Business.NavbarImageURL,
			CustomDomain:       bs.Business.CustomDomain,
			IsActive:           bs.Business.IsActive,
			EnableDelivery:     bs.Business.EnableDelivery,
			EnablePickup:       bs.Business.EnablePickup,
			EnableReservations: bs.Business.EnableReservations,
		}
		if bs.Business.BusinessType.ID != 0 {
			businessInfo.BusinessTypeName = bs.Business.BusinessType.Name
			businessInfo.BusinessTypeCode = bs.Business.BusinessType.Code
		}
		rel.Business = &businessInfo
	}

	return rel, nil
}

// AssignRoleToUserBusiness asigna o actualiza roles de un usuario en múltiples businesses
// Valida que el usuario esté asociado a cada business y que cada rol sea del mismo tipo de business
func (r *Repository) AssignRoleToUserBusiness(ctx context.Context, userID uint, assignments []domain.BusinessRoleAssignment) error {
	db := r.database.Conn(ctx)

	// Verificar que el usuario existe
	var user models.User
	if err := db.Where("id = ?", userID).First(&user).Error; err != nil {
		r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al encontrar usuario")
		return fmt.Errorf("usuario no encontrado")
	}

	if len(assignments) == 0 {
		return fmt.Errorf("no se proporcionaron asignaciones")
	}

	// Obtener todos los businesses y roles únicos para validar de una vez
	businessSet := make(map[uint]struct{})
	roleSet := make(map[uint]struct{})
	for _, assignment := range assignments {
		businessSet[assignment.BusinessID] = struct{}{}
		roleSet[assignment.RoleID] = struct{}{}
	}

	businessIDs := make([]uint, 0, len(businessSet))
	for id := range businessSet {
		businessIDs = append(businessIDs, id)
	}

	roleIDs := make([]uint, 0, len(roleSet))
	for id := range roleSet {
		roleIDs = append(roleIDs, id)
	}

	// Verificar que todos los businesses existen
	var businesses []models.Business
	if err := db.Preload("BusinessType").Where("id IN ?", businessIDs).Find(&businesses).Error; err != nil {
		r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al obtener businesses")
		return fmt.Errorf("error al verificar businesses")
	}

	if len(businesses) != len(businessIDs) {
		r.logger.Error().
			Uint("user_id", userID).
			Int("expected", len(businessIDs)).
			Int("found", len(businesses)).
			Msg("Algunos businesses no existen")
		return fmt.Errorf("algunos businesses no existen")
	}

	// Crear mapa de businesses por ID
	businessMap := make(map[uint]models.Business)
	for _, b := range businesses {
		businessMap[b.ID] = b
	}

	// Verificar que todos los roles existen
	var roles []models.Role
	if err := db.Where("id IN ?", roleIDs).Find(&roles).Error; err != nil {
		r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al obtener roles")
		return fmt.Errorf("error al verificar roles")
	}

	if len(roles) != len(roleIDs) {
		r.logger.Error().
			Uint("user_id", userID).
			Int("expected", len(roleIDs)).
			Int("found", len(roles)).
			Msg("Algunos roles no existen")
		return fmt.Errorf("algunos roles no existen")
	}

	// Crear mapa de roles por ID
	roleMap := make(map[uint]models.Role)
	for _, role := range roles {
		roleMap[role.ID] = role
	}

	// Validar cada asignación: tipo de business del rol debe coincidir con el del business
	for _, assignment := range assignments {
		business, businessExists := businessMap[assignment.BusinessID]
		if !businessExists {
			return fmt.Errorf("business %d no encontrado", assignment.BusinessID)
		}

		role, roleExists := roleMap[assignment.RoleID]
		if !roleExists {
			return fmt.Errorf("rol %d no encontrado", assignment.RoleID)
		}

		// Validar que el rol es del mismo tipo de business
		if role.BusinessTypeID == nil || *role.BusinessTypeID != business.BusinessTypeID {
			var roleBusinessTypeID uint
			if role.BusinessTypeID != nil {
				roleBusinessTypeID = *role.BusinessTypeID
			}
			r.logger.Error().
				Uint("role_id", assignment.RoleID).
				Uint("role_business_type_id", roleBusinessTypeID).
				Uint("business_id", assignment.BusinessID).
				Uint("business_type_id", business.BusinessTypeID).
				Msg("El rol no corresponde al tipo de business")
			return fmt.Errorf("el rol %d no corresponde al tipo de business del business %d", assignment.RoleID, assignment.BusinessID)
		}
	}

	// Iniciar transacción para actualizar todas las asignaciones
	return db.Transaction(func(tx *gorm.DB) error {
		for _, assignment := range assignments {
			// Verificar que el usuario está asociado al business en business_staff
			var existingBS models.BusinessStaff
			if err := tx.Where("user_id = ? AND business_id = ?", userID, assignment.BusinessID).First(&existingBS).Error; err != nil {
				if err == gorm.ErrRecordNotFound {
					r.logger.Error().
						Uint("user_id", userID).
						Uint("business_id", assignment.BusinessID).
						Msg("El usuario no está asociado a este business")
					return fmt.Errorf("el usuario no está asociado al business %d", assignment.BusinessID)
				}
				r.logger.Error().
					Uint("user_id", userID).
					Uint("business_id", assignment.BusinessID).
					Err(err).
					Msg("Error al verificar relación business_staff")
				return fmt.Errorf("error al verificar relación usuario-business")
			}

			// Actualizar el role_id en business_staff
			if err := tx.Model(&existingBS).Update("role_id", assignment.RoleID).Error; err != nil {
				r.logger.Error().
					Uint("user_id", userID).
					Uint("business_id", assignment.BusinessID).
					Uint("role_id", assignment.RoleID).
					Err(err).
					Msg("Error al actualizar role_id en business_staff")
				return fmt.Errorf("error al asignar rol %d al business %d", assignment.RoleID, assignment.BusinessID)
			}
		}

		r.logger.Info().
			Uint("user_id", userID).
			Int("assignments_count", len(assignments)).
			Msg("Roles asignados exitosamente a usuario en businesses")

		return nil
	})
}
