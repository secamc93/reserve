package repository

import (
	"context"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

// GetPlatformRoleID devuelve el rol de alcance platform (el de menor id si hubiera varios), o 0 si no existe.
func (r *Repository) GetPlatformRoleID(ctx context.Context) (uint, error) {
	var role models.Role
	err := r.database.Conn(ctx).
		Joins("Scope").
		Where(`"Scope".code = ?`, "platform").
		Order("role.id").
		First(&role).Error
	if err == gorm.ErrRecordNotFound {
		return 0, nil
	}
	if err != nil {
		r.logger.Error().Err(err).Msg("Error al buscar el rol de alcance platform")
		return 0, err
	}
	return role.ID, nil
}

// SetPlatformRole asigna (enabled) o quita el rol de plataforma del usuario: una fila de
// business_staff sin propiedad (business_id NULL). Si había una fila borrada, se restaura.
func (r *Repository) SetPlatformRole(ctx context.Context, userID uint, roleID uint, enabled bool) error {
	db := r.database.Conn(ctx)
	if !enabled {
		return db.Where("user_id = ? AND business_id IS NULL AND role_id = ?", userID, roleID).
			Delete(&models.BusinessStaff{}).Error
	}

	var existing models.BusinessStaff
	err := db.Unscoped().
		Where("user_id = ? AND business_id IS NULL AND role_id = ?", userID, roleID).
		First(&existing).Error
	if err == nil {
		if !existing.DeletedAt.Valid {
			return nil // ya es super admin
		}
		return db.Unscoped().Model(&existing).Update("deleted_at", nil).Error
	}
	if err != gorm.ErrRecordNotFound {
		return err
	}
	rid := roleID
	return db.Create(&models.BusinessStaff{UserID: userID, BusinessID: nil, RoleID: &rid}).Error
}
