package mappers

import (
	"central_reserve/services/auth/internal/domain"
	"dbpostgres/app/infra/models"
	"time"

	"gorm.io/gorm"
)

// ToUserModel convierte entities.User a models.User
func ToUserModel(user domain.UsersEntity) models.User {
	var deletedAt gorm.DeletedAt
	if user.DeletedAt != nil {
		deletedAt = gorm.DeletedAt{Time: *user.DeletedAt, Valid: true}
	}

	return models.User{
		Model: gorm.Model{
			ID:        user.ID,
			CreatedAt: user.CreatedAt,
			UpdatedAt: user.UpdatedAt,
			DeletedAt: deletedAt,
		},
		Name:        user.Name,
		Email:       user.Email,
		Password:    user.Password,
		Phone:       user.Phone,
		AvatarURL:   user.AvatarURL,
		IsActive:    user.IsActive,
		LastLoginAt: user.LastLoginAt,
	}
}

// ToUserEntity convierte models.User a entities.User
func ToUserEntity(user models.User) domain.UsersEntity {
	var deletedAt *time.Time
	if user.Model.DeletedAt.Valid {
		deletedAt = &user.Model.DeletedAt.Time
	}

	return domain.UsersEntity{
		ID:          user.Model.ID,
		Name:        user.Name,
		Email:       user.Email,
		Password:    user.Password,
		Phone:       user.Phone,
		AvatarURL:   user.AvatarURL,
		IsActive:    user.IsActive,
		LastLoginAt: user.LastLoginAt,
		CreatedAt:   user.Model.CreatedAt,
		UpdatedAt:   user.Model.UpdatedAt,
		DeletedAt:   deletedAt,
	}
}

// CreateUserModel crea un models.User para inserción (sin ID)
func CreateUserModel(user domain.UsersEntity) models.User {
	return models.User{
		Name:        user.Name,
		Email:       user.Email,
		Password:    user.Password,
		Phone:       user.Phone,
		AvatarURL:   user.AvatarURL,
		IsActive:    user.IsActive,
		LastLoginAt: user.LastLoginAt,
	}
}
