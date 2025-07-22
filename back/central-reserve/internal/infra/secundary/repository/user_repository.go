package repository

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/domain/entities"
	"central_reserve/internal/infra/secundary/repository/db"
	"central_reserve/internal/pkg/log"
	"context"
	"fmt"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

// UserRepository implementa el repositorio de usuarios
type UserRepository struct {
	database db.IDatabase
	logger   log.ILogger
}

// NewUserRepository crea una nueva instancia del repositorio de usuarios
func NewUserRepository(database db.IDatabase, logger log.ILogger) *UserRepository {
	return &UserRepository{
		database: database,
		logger:   logger,
	}
}

// GetUsers obtiene usuarios filtrados y paginados con sus roles y businesses
func (r *UserRepository) GetUsers(ctx context.Context, filters dtos.UserFilters) ([]dtos.UserQueryDTO, int64, error) {
	var users []dtos.UserQueryDTO
	var total int64

	// Usar conexión con debug habilitado
	db := r.database.DebugConn(ctx).Table("user")

	// Filtros simples
	if filters.Name != "" {
		db = db.Where("name ILIKE ?", "%"+filters.Name+"%")
	}
	if filters.Email != "" {
		db = db.Where("email ILIKE ?", "%"+filters.Email+"%")
	}
	if filters.Phone != "" {
		db = db.Where("phone ILIKE ?", "%"+filters.Phone+"%")
	}
	if filters.IsActive != nil {
		db = db.Where("is_active = ?", *filters.IsActive)
	}
	if filters.RoleID != nil {
		db = db.Joins("JOIN user_roles ur ON user.id = ur.user_id").
			Where("ur.role_id = ?", *filters.RoleID)
	}
	if filters.BusinessID != nil {
		db = db.Joins("JOIN user_businesses ub ON user.id = ub.user_id").
			Where("ub.business_id = ?", *filters.BusinessID)
	}
	if filters.CreatedAt != "" {
		dates := strings.Split(filters.CreatedAt, ",")
		if len(dates) == 1 {
			db = db.Where("DATE(created_at) = ?", dates[0])
		} else if len(dates) == 2 {
			db = db.Where("DATE(created_at) BETWEEN ? AND ?", dates[0], dates[1])
		}
	}

	// Contar total antes de paginar
	if err := db.Count(&total).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error al contar usuarios")
		return nil, 0, err
	}

	// Ordenamiento
	orderBy := "created_at DESC"
	if filters.SortBy != "" {
		sortField := filters.SortBy
		sortOrder := "ASC"
		if strings.ToUpper(filters.SortOrder) == "DESC" {
			sortOrder = "DESC"
		}
		orderBy = fmt.Sprintf("%s %s", sortField, sortOrder)
	}

	// Obtener usuarios básicos (sin Roles y Businesses)
	err := db.
		Select("id, name, email, phone, avatar_url, is_active, last_login_at, created_at, updated_at, deleted_at").
		Order(orderBy).
		Offset((filters.Page - 1) * filters.PageSize).
		Limit(filters.PageSize).
		Find(&users).Error

	if err != nil {
		r.logger.Error().Err(err).Msg("Error al obtener usuarios")
		return nil, 0, err
	}

	return users, total, nil
}

// GetUserRoles obtiene los roles de un usuario específico
func (r *UserRepository) GetUserRoles(ctx context.Context, userID uint) ([]entities.Role, error) {
	var roles []entities.Role
	err := r.database.DebugConn(ctx).
		Table("role r").
		Select("r.id, r.name, r.code, r.description, r.level, r.is_system, r.scope_id, s.name as scope_name, s.code as scope_code, r.created_at, r.updated_at, r.deleted_at").
		Joins("JOIN user_roles ur ON r.id = ur.role_id").
		Joins("LEFT JOIN scope s ON r.scope_id = s.id").
		Where("ur.user_id = ?", userID).
		Find(&roles).Error

	if err != nil {
		r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al obtener roles del usuario")
		return nil, err
	}

	return roles, nil
}

// GetUserBusinesses obtiene los businesses de un usuario específico
func (r *UserRepository) GetUserBusinesses(ctx context.Context, userID uint) ([]entities.BusinessInfo, error) {
	var businesses []entities.BusinessInfo
	err := r.database.DebugConn(ctx).
		Table("business b").
		Select("b.id, b.name, b.code, b.business_type_id, b.timezone, b.address, b.description, b.logo_url, b.primary_color, b.secondary_color, b.custom_domain, b.is_active, b.enable_delivery, b.enable_pickup, b.enable_reservations, bt.name as business_type_name, bt.code as business_type_code").
		Joins("JOIN user_businesses ub ON b.id = ub.business_id").
		Joins("LEFT JOIN business_type bt ON b.business_type_id = bt.id").
		Where("ub.user_id = ?", userID).
		Find(&businesses).Error

	if err != nil {
		r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al obtener businesses del usuario")
		return nil, err
	}

	return businesses, nil
}

// GetUserByID obtiene un usuario por su ID con sus roles y businesses
func (r *UserRepository) GetUserByID(ctx context.Context, id uint) (*entities.User, error) {
	var user entities.User
	if err := r.database.DebugConn(ctx).
		Table("user").
		Select(`
			user.*,
			COALESCE(roles_data.roles, '[]') as roles_json,
			COALESCE(businesses_data.businesses, '[]') as businesses_json
		`).
		Joins(`
			LEFT JOIN (
				SELECT 
					ur.user_id,
					JSON_AGG(
						JSON_BUILD_OBJECT(
							'id', r.id,
							'name', r.name,
							'code', r.code,
							'description', r.description,
							'level', r.level,
							'is_system', r.is_system,
							'scope_id', r.scope_id,
							'scope_name', s.name,
							'scope_code', s.code
						)
					) as roles
				FROM user_roles ur
				LEFT JOIN role r ON ur.role_id = r.id
				LEFT JOIN scope s ON r.scope_id = s.id
				WHERE ur.user_id = ?
				GROUP BY ur.user_id
			) roles_data ON user.id = roles_data.user_id
		`, id).
		Joins(`
			LEFT JOIN (
				SELECT 
					ub.user_id,
					JSON_AGG(
						JSON_BUILD_OBJECT(
							'id', b.id,
							'name', b.name,
							'code', b.code,
							'business_type_id', b.business_type_id,
							'timezone', b.timezone,
							'address', b.address,
							'description', b.description,
							'logo_url', b.logo_url,
							'primary_color', b.primary_color,
							'secondary_color', b.secondary_color,
							'custom_domain', b.custom_domain,
							'is_active', b.is_active,
							'enable_delivery', b.enable_delivery,
							'enable_pickup', b.enable_pickup,
							'enable_reservations', b.enable_reservations,
							'business_type_name', bt.name,
							'business_type_code', bt.code
						)
					) as businesses
				FROM user_businesses ub
				LEFT JOIN business b ON ub.business_id = b.id
				LEFT JOIN business_type bt ON b.business_type_id = bt.id
				WHERE ub.user_id = ?
				GROUP BY ub.user_id
			) businesses_data ON user.id = businesses_data.user_id
		`, id).
		Where("user.id = ?", id).
		First(&user).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al obtener usuario por ID")
		return nil, err
	}
	return &user, nil
}

// GetUserByEmail obtiene un usuario por su email
func (r *UserRepository) GetUserByEmail(ctx context.Context, email string) (*entities.User, error) {
	var user entities.User
	if err := r.database.Conn(ctx).Table("user").Where("email = ?", email).First(&user).Error; err != nil {
		r.logger.Error().Str("email", email).Err(err).Msg("Error al obtener usuario por email")
		return nil, err
	}
	return &user, nil
}

// CreateUser crea un nuevo usuario
func (r *UserRepository) CreateUser(ctx context.Context, user entities.User) (uint, error) {
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
func (r *UserRepository) UpdateUser(ctx context.Context, id uint, user entities.User) (string, error) {
	// Si se proporciona una nueva contraseña, hashearla
	if user.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
		if err != nil {
			r.logger.Error().Err(err).Msg("Error al hashear contraseña")
			return "", fmt.Errorf("error al procesar contraseña")
		}
		user.Password = string(hashedPassword)
	}

	if err := r.database.Conn(ctx).Table("user").Where("id = ?", id).Updates(&user).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al actualizar usuario")
		return "", err
	}

	r.logger.Info().Uint("user_id", id).Msg("Usuario actualizado exitosamente")
	return fmt.Sprintf("Usuario con ID %d actualizado exitosamente", id), nil
}

// DeleteUser elimina un usuario
func (r *UserRepository) DeleteUser(ctx context.Context, id uint) (string, error) {
	if err := r.database.Conn(ctx).Table("user").Where("id = ?", id).Delete(&entities.User{}).Error; err != nil {
		r.logger.Error().Uint("id", id).Err(err).Msg("Error al eliminar usuario")
		return "", err
	}

	r.logger.Info().Uint("user_id", id).Msg("Usuario eliminado exitosamente")
	return fmt.Sprintf("Usuario con ID %d eliminado exitosamente", id), nil
}

// AssignRolesToUser asigna roles a un usuario
func (r *UserRepository) AssignRolesToUser(ctx context.Context, userID uint, roleIDs []uint) error {
	// Eliminar roles existentes
	if err := r.database.Conn(ctx).Table("user_roles").Where("user_id = ?", userID).Delete(&entities.UserRole{}).Error; err != nil {
		r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al eliminar roles existentes")
		return err
	}

	// Asignar nuevos roles
	for _, roleID := range roleIDs {
		userRole := entities.UserRole{
			UserID: userID,
			RoleID: roleID,
		}
		if err := r.database.Conn(ctx).Table("user_roles").Create(&userRole).Error; err != nil {
			r.logger.Error().Uint("user_id", userID).Uint("role_id", roleID).Err(err).Msg("Error al asignar rol")
			return err
		}
	}

	r.logger.Info().Uint("user_id", userID).Int("roles_count", len(roleIDs)).Msg("Roles asignados exitosamente")
	return nil
}

// AssignBusinessesToUser asigna businesses a un usuario
func (r *UserRepository) AssignBusinessesToUser(ctx context.Context, userID uint, businessIDs []uint) error {
	// Eliminar businesses existentes
	if err := r.database.Conn(ctx).Table("user_businesses").Where("user_id = ?", userID).Delete(&entities.UserBusiness{}).Error; err != nil {
		r.logger.Error().Uint("user_id", userID).Err(err).Msg("Error al eliminar businesses existentes")
		return err
	}

	// Asignar nuevos businesses
	for _, businessID := range businessIDs {
		userBusiness := entities.UserBusiness{
			UserID:     userID,
			BusinessID: businessID,
		}
		if err := r.database.Conn(ctx).Table("user_businesses").Create(&userBusiness).Error; err != nil {
			r.logger.Error().Uint("user_id", userID).Uint("business_id", businessID).Err(err).Msg("Error al asignar business")
			return err
		}
	}

	r.logger.Info().Uint("user_id", userID).Int("businesses_count", len(businessIDs)).Msg("Businesses asignados exitosamente")
	return nil
}
