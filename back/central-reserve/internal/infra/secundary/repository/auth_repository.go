package repository

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/domain/entities"
	"context"
	"fmt"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// AuthRepository implementa ports.IAuthRepository

// GetUserByEmail obtiene un usuario por su email (para IAuthRepository)
func (r *Repository) GetUserByEmailForAuth(ctx context.Context, email string) (*dtos.UserAuthInfo, error) {
	var userAuth dtos.UserAuthInfo
	if err := r.database.Conn(ctx).
		Table("user").
		Select("id, name, email, password, phone, avatar_url, is_active, last_login_at, created_at, updated_at, deleted_at").
		Where("email = ?", email).
		First(&userAuth).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			r.logger.Debug().Str("email", email).Msg("Usuario no encontrado")
			return nil, nil
		}
		r.logger.Error().Str("email", email).Err(err).Msg("Error al obtener usuario por email")
		return nil, err
	}
	return &userAuth, nil
}

// GetUserRoles obtiene los roles de un usuario
func (r *Repository) GetUserRoles(ctx context.Context, userID uint) ([]entities.Role, error) {
	var roles []entities.Role

	r.logger.Debug().Uint("user_id", userID).Msg("Ejecutando consulta de roles (gorm syntax)")

	err := r.database.Conn(ctx).
		Table("role").
		Select("role.*").
		Joins("inner join user_roles on role.id = user_roles.role_id").
		Joins("inner join scope on role.scope_id = scope.id").
		Where("user_roles.user_id = ?", userID).
		Find(&roles).Error

	if err != nil {
		r.logger.Error().Uint("user_id", userID).Msg("Error al obtener roles del usuario")
		return nil, err
	}

	r.logger.Debug().Uint("user_id", userID).Int("roles_count", len(roles)).Msg("Roles encontrados")
	return roles, nil
}

// GetRolePermissions obtiene los permisos de un rol
func (r *Repository) GetRolePermissions(ctx context.Context, roleID uint) ([]entities.Permission, error) {
	var permissions []entities.Permission

	r.logger.Debug().Uint("role_id", roleID).Msg("Ejecutando consulta de permisos (gorm syntax)")

	err := r.database.Conn(ctx).
		Table("permission").
		Select("permission.*").
		Joins("inner join role_permissions on permission.id = role_permissions.permission_id").
		Joins("inner join scope on permission.scope_id = scope.id").
		Where("role_permissions.role_id = ?", roleID).
		Find(&permissions).Error

	if err != nil {
		r.logger.Error().Uint("role_id", roleID).Msg("Error al obtener permisos del rol")
		return nil, err
	}

	r.logger.Debug().Uint("role_id", roleID).Int("permissions_count", len(permissions)).Msg("Permisos encontrados")
	return permissions, nil
}

// UpdateLastLogin actualiza el último login del usuario
func (r *Repository) UpdateLastLogin(ctx context.Context, userID uint) error {
	now := time.Now()
	if err := r.database.Conn(ctx).Table("user").Where("id = ?", userID).Update("last_login_at", now).Error; err != nil {
		r.logger.Error().Uint("user_id", userID).Msg("Error al actualizar último login")
		return err
	}
	return nil
}

// GetUserByID obtiene un usuario por su ID (para IAuthRepository)
func (r *Repository) GetUserByIDForAuth(ctx context.Context, userID uint) (*dtos.UserAuthInfo, error) {
	var userAuth dtos.UserAuthInfo
	if err := r.database.Conn(ctx).
		Table("user").
		Select("id, name, email, password, phone, avatar_url, is_active, last_login_at, created_at, updated_at, deleted_at").
		Where("id = ?", userID).
		First(&userAuth).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			r.logger.Debug().Uint("user_id", userID).Msg("Usuario no encontrado")
			return nil, nil
		}
		r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al obtener usuario por ID")
		return nil, err
	}
	return &userAuth, nil
}

// ChangePassword cambia la contraseña de un usuario
func (r *Repository) ChangePassword(ctx context.Context, userID uint, newPassword string) error {
	// Hash de la nueva contraseña
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		r.logger.Error().Err(err).Msg("Error al hashear nueva contraseña")
		return fmt.Errorf("error al procesar contraseña")
	}

	// Actualizar contraseña en la base de datos
	if err := r.database.Conn(ctx).
		Table("user").
		Where("id = ?", userID).
		Update("password", string(hashedPassword)).Error; err != nil {
		r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al actualizar contraseña")
		return err
	}

	r.logger.Info().Uint("user_id", userID).Msg("Contraseña actualizada exitosamente")
	return nil
}

// GetUsers obtiene usuarios con filtros
func (r *Repository) GetUsers(ctx context.Context, filters dtos.UserFilters) ([]dtos.UserQueryDTO, int64, error) {
	var users []dtos.UserQueryDTO
	var total int64

	query := r.database.Conn(ctx).Table("user")

	// Aplicar filtros
	if filters.Email != "" {
		query = query.Where("email LIKE ?", "%"+filters.Email+"%")
	}
	if filters.Name != "" {
		query = query.Where("name LIKE ?", "%"+filters.Name+"%")
	}
	if filters.IsActive != nil {
		query = query.Where("is_active = ?", *filters.IsActive)
	}

	// Contar total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Aplicar paginación (comentado hasta verificar la estructura de UserFilters)
	// if filters.Limit > 0 {
	// 	query = query.Limit(filters.Limit)
	// }
	// if filters.Offset > 0 {
	// 	query = query.Offset(filters.Offset)
	// }

	if err := query.Find(&users).Error; err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

// GetUserBusinesses obtiene los negocios de un usuario
func (r *Repository) GetUserBusinesses(ctx context.Context, userID uint) ([]entities.BusinessInfo, error) {
	var businesses []entities.BusinessInfo

	err := r.database.Conn(ctx).
		Table("business").
		Select("business.*").
		Joins("inner join user_business on business.id = user_business.business_id").
		Where("user_business.user_id = ?", userID).
		Find(&businesses).Error

	if err != nil {
		r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al obtener negocios del usuario")
		return nil, err
	}

	return businesses, nil
}

// CreateUser crea un nuevo usuario
func (r *Repository) CreateUser(ctx context.Context, user entities.User) (uint, error) {
	// Hash de la contraseña
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		r.logger.Error().Err(err).Msg("Error al hashear contraseña")
		return 0, fmt.Errorf("error al procesar contraseña")
	}
	user.Password = string(hashedPassword)

	if err := r.database.Conn(ctx).Table("user").Create(&user).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al crear usuario")
		return 0, err
	}

	r.logger.Info().Uint("user_id", user.ID).Msg("Usuario creado exitosamente")
	return user.ID, nil
}

// UpdateUser actualiza un usuario existente
func (r *Repository) UpdateUser(ctx context.Context, id uint, user entities.User) (string, error) {
	if err := r.database.Conn(ctx).Table("user").Where("id = ?", id).Updates(&user).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al actualizar usuario")
		return "", err
	}

	r.logger.Info().Uint("id", id).Msg("Usuario actualizado exitosamente")
	return fmt.Sprintf("Usuario actualizado con ID: %d", id), nil
}

// DeleteUser elimina un usuario
func (r *Repository) DeleteUser(ctx context.Context, id uint) (string, error) {
	if err := r.database.Conn(ctx).Table("user").Where("id = ?", id).Delete(&entities.User{}).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al eliminar usuario")
		return "", err
	}

	r.logger.Info().Uint("id", id).Msg("Usuario eliminado exitosamente")
	return fmt.Sprintf("Usuario eliminado con ID: %d", id), nil
}

// AssignRolesToUser asigna roles a un usuario
func (r *Repository) AssignRolesToUser(ctx context.Context, userID uint, roleIDs []uint) error {
	// Primero eliminar asignaciones existentes
	if err := r.database.Conn(ctx).Table("user_roles").Where("user_id = ?", userID).Delete(&struct{}{}).Error; err != nil {
		r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al eliminar roles existentes")
		return err
	}

	// Crear nuevas asignaciones
	for _, roleID := range roleIDs {
		assignment := map[string]interface{}{
			"user_id":    userID,
			"role_id":    roleID,
			"created_at": time.Now(),
			"updated_at": time.Now(),
		}

		if err := r.database.Conn(ctx).Table("user_roles").Create(&assignment).Error; err != nil {
			r.logger.Error().Uint("user_id", userID).Uint("role_id", roleID).Err(err).Msg("Error al asignar rol a usuario")
			return err
		}
	}

	r.logger.Info().Uint("user_id", userID).Interface("role_ids", roleIDs).Msg("Roles asignados exitosamente")
	return nil
}

// AssignBusinessesToUser asigna negocios a un usuario
func (r *Repository) AssignBusinessesToUser(ctx context.Context, userID uint, businessIDs []uint) error {
	// Primero eliminar asignaciones existentes
	if err := r.database.Conn(ctx).Table("user_business").Where("user_id = ?", userID).Delete(&struct{}{}).Error; err != nil {
		r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al eliminar asignaciones existentes")
		return err
	}

	// Crear nuevas asignaciones
	for _, businessID := range businessIDs {
		assignment := map[string]interface{}{
			"user_id":     userID,
			"business_id": businessID,
			"created_at":  time.Now(),
			"updated_at":  time.Now(),
		}

		if err := r.database.Conn(ctx).Table("user_business").Create(&assignment).Error; err != nil {
			r.logger.Error().Uint("user_id", userID).Uint("business_id", businessID).Err(err).Msg("Error al asignar negocio a usuario")
			return err
		}
	}

	r.logger.Info().Uint("user_id", userID).Interface("business_ids", businessIDs).Msg("Negocios asignados exitosamente")
	return nil
}

// GetUserByEmail para IUserRepository (devuelve *entities.User)
func (r *Repository) GetUserByEmail(ctx context.Context, email string) (*dtos.UserAuthInfo, error) {
	var user dtos.UserAuthInfo
	if err := r.database.Conn(ctx).
		Table("user").
		Where("email = ?", email).
		First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			r.logger.Debug().Str("email", email).Msg("Usuario no encontrado")
			return nil, nil
		}
		r.logger.Error().Str("email", email).Err(err).Msg("Error al obtener usuario por email")
		return nil, err
	}
	return &user, nil
}

// GetUserByID para IUserRepository (devuelve *entities.User)
func (r *Repository) GetUserByID(ctx context.Context, id uint) (*dtos.UserAuthInfo, error) {
	var user dtos.UserAuthInfo
	if err := r.database.Conn(ctx).
		Table("user").
		Where("id = ?", id).
		First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			r.logger.Debug().Uint("id", id).Msg("Usuario no encontrado")
			return nil, nil
		}
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al obtener usuario por ID")
		return nil, err
	}
	return &user, nil
}
