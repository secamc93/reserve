package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/secondary/repository/mappers"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// GetVotingGroup lee el grupo de votación.
//
// Tabla consultada: voting_groups (gestionada por el módulo de votaciones). Replicado localmente
// para no compartir repositorios entre módulos.
func (r *repository) GetVotingGroup(ctx context.Context, groupID uint) (*entities.VotingGroup, error) {
	var group models.VotingGroup
	if err := r.db.Conn(ctx).First(&group, groupID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, fmt.Errorf("error obteniendo grupo de votación: %w", err)
	}
	return &entities.VotingGroup{
		ID:              group.ID,
		BusinessID:      group.BusinessID,
		Name:            group.Name,
		VotingStartDate: group.VotingStartDate,
		VotingEndDate:   group.VotingEndDate,
	}, nil
}

// IsExempt dice si la propiedad está exenta del cobro. Sin configuración no lo está.
func (r *repository) IsExempt(ctx context.Context, businessID uint) (bool, error) {
	var setting models.VotingBillingSetting
	err := r.db.Conn(ctx).Where("business_id = ?", businessID).Limit(1).Find(&setting).Error
	if err != nil {
		return false, fmt.Errorf("error leyendo exención de cobro: %w", err)
	}
	return setting.ID != 0 && setting.Exempt, nil
}

// SetExempt crea o actualiza la configuración de cobro de la propiedad.
func (r *repository) SetExempt(ctx context.Context, businessID uint, exempt bool, userID *uint) error {
	setting := models.VotingBillingSetting{BusinessID: businessID, Exempt: exempt, UpdatedByUserID: userID}
	err := r.db.Conn(ctx).Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "business_id"}},
		DoUpdates: clause.Assignments(map[string]any{"exempt": exempt, "updated_by_user_id": userID, "updated_at": time.Now(), "deleted_at": nil}),
	}).Create(&setting).Error
	if err != nil {
		return fmt.Errorf("error guardando exención de cobro: %w", err)
	}
	return nil
}

// SumApprovedDays suma los días de los pagos aprobados del grupo.
func (r *repository) SumApprovedDays(ctx context.Context, groupID uint) (int, error) {
	var days int
	err := r.db.Conn(ctx).Model(&models.VotingGroupPayment{}).
		Where("voting_group_id = ? AND status = ?", groupID, entities.StatusApproved).
		Select("COALESCE(SUM(days), 0)").Scan(&days).Error
	if err != nil {
		return 0, fmt.Errorf("error sumando días pagados: %w", err)
	}
	return days, nil
}

// ListPaymentsByGroup lista los pagos del grupo, el más reciente primero.
func (r *repository) ListPaymentsByGroup(ctx context.Context, groupID uint) ([]entities.Payment, error) {
	var rows []models.VotingGroupPayment
	if err := r.db.Conn(ctx).Where("voting_group_id = ?", groupID).Order("created_at DESC").Find(&rows).Error; err != nil {
		return nil, fmt.Errorf("error listando pagos del grupo: %w", err)
	}
	return mappers.PaymentsToDomain(rows), nil
}

// CreatePayment guarda un pago.
func (r *repository) CreatePayment(ctx context.Context, payment *entities.Payment) (*entities.Payment, error) {
	model := mappers.PaymentToModel(payment)
	if err := r.db.Conn(ctx).Create(model).Error; err != nil {
		return nil, fmt.Errorf("error creando pago: %w", err)
	}
	created := mappers.PaymentToDomain(model)
	return &created, nil
}

// GetPaymentByReference trae el pago con esa referencia, o nil si no existe.
func (r *repository) GetPaymentByReference(ctx context.Context, reference string) (*entities.Payment, error) {
	var model models.VotingGroupPayment
	if err := r.db.Conn(ctx).Where("reference = ?", reference).First(&model).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, fmt.Errorf("error obteniendo pago: %w", err)
	}
	payment := mappers.PaymentToDomain(&model)
	return &payment, nil
}

// UpdatePaymentFromTransaction guarda el estado que reporta la pasarela. Nunca toca un pago ya
// aprobado (la condición va en la misma consulta para no pisar una aprobación concurrente).
func (r *repository) UpdatePaymentFromTransaction(ctx context.Context, paymentID uint, tx entities.Transaction, paidAt *time.Time) error {
	err := r.db.Conn(ctx).Model(&models.VotingGroupPayment{}).
		Where("id = ? AND status <> ?", paymentID, entities.StatusApproved).
		Updates(map[string]any{
			"status":                  tx.Status,
			"provider_transaction_id": tx.ID,
			"payment_method_type":     tx.PaymentMethodType,
			"paid_at":                 paidAt,
		}).Error
	if err != nil {
		return fmt.Errorf("error actualizando pago: %w", err)
	}
	return nil
}
