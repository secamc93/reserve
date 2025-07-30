package mapper

import (
	"central_reserve/internal/domain/entities"
	"dbpostgres/app/infra/models"
	"time"

	"gorm.io/gorm"
)

// ToUserModel convierte entities.User a models.User
func ToUserModel(user entities.User) models.User {
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
func ToUserEntity(user models.User) entities.User {
	var deletedAt *time.Time
	if user.DeletedAt.Valid {
		deletedAt = &user.DeletedAt.Time
	}

	return entities.User{
		ID:          user.ID,
		Name:        user.Name,
		Email:       user.Email,
		Password:    user.Password,
		Phone:       user.Phone,
		AvatarURL:   user.AvatarURL,
		IsActive:    user.IsActive,
		LastLoginAt: user.LastLoginAt,
		CreatedAt:   user.CreatedAt,
		UpdatedAt:   user.UpdatedAt,
		DeletedAt:   deletedAt,
	}
}

// CreateUserModel crea un models.User para inserción (sin ID)
func CreateUserModel(user entities.User) models.User {
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
