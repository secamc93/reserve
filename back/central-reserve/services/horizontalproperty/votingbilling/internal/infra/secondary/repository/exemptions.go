package repository

import (
	"context"
	"fmt"
	"time"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm/clause"
)

// IsPropertyExempt dice si la propiedad está exenta. Sin configuración no lo está.
func (r *repository) IsPropertyExempt(ctx context.Context, businessID uint) (bool, error) {
	var n int64
	err := r.db.Conn(ctx).Model(&models.VotingBillingSetting{}).
		Where("business_id = ? AND exempt = ?", businessID, true).Count(&n).Error
	if err != nil {
		return false, fmt.Errorf("error leyendo exención de la propiedad: %w", err)
	}
	return n > 0, nil
}

// IsAdminExempt dice si algún administrador de la propiedad está exento.
//
// Tabla consultada: business_staff (gestionada por el módulo de auth). Replicado localmente.
func (r *repository) IsAdminExempt(ctx context.Context, businessID uint) (bool, error) {
	var n int64
	admins := r.db.Conn(ctx).Model(&models.BusinessStaff{}).Select("user_id").Where("business_id = ?", businessID)
	err := r.db.Conn(ctx).Model(&models.VotingBillingUserExemption{}).
		Where("exempt = ? AND user_id IN (?)", true, admins).Count(&n).Error
	if err != nil {
		return false, fmt.Errorf("error leyendo exención de administradores: %w", err)
	}
	return n > 0, nil
}

// SetPropertyExempt crea o actualiza la exención de la propiedad.
func (r *repository) SetPropertyExempt(ctx context.Context, businessID uint, exempt bool, byUserID *uint) error {
	row := models.VotingBillingSetting{BusinessID: businessID, Exempt: exempt, UpdatedByUserID: byUserID}
	err := r.db.Conn(ctx).Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "business_id"}},
		DoUpdates: clause.Assignments(map[string]any{"exempt": exempt, "updated_by_user_id": byUserID, "updated_at": time.Now(), "deleted_at": nil}),
	}).Create(&row).Error
	if err != nil {
		return fmt.Errorf("error guardando exención de la propiedad: %w", err)
	}
	return nil
}

// SetUserExempt crea o actualiza la exención de un administrador.
func (r *repository) SetUserExempt(ctx context.Context, userID uint, exempt bool, notes string, byUserID *uint) error {
	row := models.VotingBillingUserExemption{UserID: userID, Exempt: exempt, Notes: notes, UpdatedByUserID: byUserID}
	err := r.db.Conn(ctx).Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}},
		DoUpdates: clause.Assignments(map[string]any{"exempt": exempt, "notes": notes, "updated_by_user_id": byUserID, "updated_at": time.Now(), "deleted_at": nil}),
	}).Create(&row).Error
	if err != nil {
		return fmt.Errorf("error guardando exención del administrador: %w", err)
	}
	return nil
}

// CountManagedProperties cuenta las propiedades que administra el usuario (business_staff).
func (r *repository) CountManagedProperties(ctx context.Context, userID uint) (int64, error) {
	var n int64
	err := r.db.Conn(ctx).Model(&models.BusinessStaff{}).
		Where("user_id = ? AND business_id IS NOT NULL", userID).Count(&n).Error
	if err != nil {
		return 0, fmt.Errorf("error contando propiedades del usuario: %w", err)
	}
	return n, nil
}

// ListPropertyAdmins lista los usuarios vinculados a la propiedad con su exención.
//
// Tablas consultadas: business_staff y user (módulo de auth). Replicado localmente.
func (r *repository) ListPropertyAdmins(ctx context.Context, businessID uint) ([]entities.PropertyAdmin, error) {
	var rows []struct {
		UserID uint
		Name   string
		Email  string
		Exempt bool
	}
	err := r.db.Conn(ctx).Model(&models.BusinessStaff{}).
		Select(`business_staff.user_id, "user".name, "user".email, COALESCE(e.exempt, false) AS exempt`).
		Joins(`JOIN "user" ON "user".id = business_staff.user_id AND "user".deleted_at IS NULL`).
		Joins(`LEFT JOIN horizontal_property.voting_billing_user_exemptions e ON e.user_id = business_staff.user_id AND e.deleted_at IS NULL`).
		Where("business_staff.business_id = ?", businessID).
		Order(`"user".name`).Scan(&rows).Error
	if err != nil {
		return nil, fmt.Errorf("error listando administradores: %w", err)
	}
	out := make([]entities.PropertyAdmin, len(rows))
	for i, row := range rows {
		out[i] = entities.PropertyAdmin{UserID: row.UserID, Name: row.Name, Email: row.Email, Exempt: row.Exempt}
	}
	return out, nil
}
