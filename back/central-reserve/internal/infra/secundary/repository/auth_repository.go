package repository

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/domain/entities"
	"central_reserve/internal/domain/ports"
	"central_reserve/internal/infra/secundary/repository/db"
	"central_reserve/internal/pkg/log"
	"context"
	"fmt"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// AuthRepository implementa ports.IAuthRepository
type AuthRepository struct {
	database db.IDatabase
	logger   log.ILogger
}

// NewAuthRepository crea una nueva instancia del repositorio de autenticación
func NewAuthRepository(database db.IDatabase, logger log.ILogger) ports.IAuthRepository {
	return &AuthRepository{
		database: database,
		logger:   logger,
	}
}

// GetUserByEmail obtiene un usuario por su email
func (r *AuthRepository) GetUserByEmail(ctx context.Context, email string) (*dtos.UserAuthInfo, error) {
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
func (r *AuthRepository) GetUserRoles(ctx context.Context, userID uint) ([]entities.Role, error) {
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
func (r *AuthRepository) GetRolePermissions(ctx context.Context, roleID uint) ([]entities.Permission, error) {
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
func (r *AuthRepository) UpdateLastLogin(ctx context.Context, userID uint) error {
	now := time.Now()
	if err := r.database.Conn(ctx).Table("user").Where("id = ?", userID).Update("last_login_at", now).Error; err != nil {
		r.logger.Error().Uint("user_id", userID).Msg("Error al actualizar último login")
		return err
	}
	return nil
}

// GetUserByID obtiene un usuario por su ID
func (r *AuthRepository) GetUserByID(ctx context.Context, userID uint) (*dtos.UserAuthInfo, error) {
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
func (r *AuthRepository) ChangePassword(ctx context.Context, userID uint, newPassword string) error {
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
