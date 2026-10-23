package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"central_reserve/services/horizontalproperty/membership/internal/domain/entities"
	"central_reserve/services/horizontalproperty/membership/internal/infra/secondary/repository/mappers"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

// ManagedBusinessIDs lista las propiedades que administra el usuario.
//
// Tabla consultada: business_staff (módulo de auth). Replicado localmente.
func (r *repository) ManagedBusinessIDs(ctx context.Context, userID uint) ([]uint, error) {
	var ids []uint
	err := r.db.Conn(ctx).Model(&models.BusinessStaff{}).
		Where("user_id = ? AND business_id IS NOT NULL", userID).Pluck("business_id", &ids).Error
	if err != nil {
		return nil, fmt.Errorf("error listando propiedades del usuario: %w", err)
	}
	return ids, nil
}

func (r *repository) CreatePending(ctx context.Context, m *entities.Membership, p *entities.Payment) (*entities.Membership, *entities.Payment, error) {
	mm := mappers.MembershipToModel(m)
	pm := mappers.PaymentToModel(p)
	err := r.db.Conn(ctx).Transaction(func(tx *gorm.DB) error {
		if err := createWithProperties(tx, mm, m.BusinessIDs); err != nil {
			return err
		}
		pm.MembershipID = mm.ID
		return tx.Create(pm).Error
	})
	if err != nil {
		return nil, nil, fmt.Errorf("error creando membresía pendiente: %w", err)
	}
	outM := mappers.MembershipToDomain(mm, m.BusinessIDs)
	outP := mappers.PaymentToDomain(pm)
	return &outM, &outP, nil
}

func (r *repository) CreateActive(ctx context.Context, m *entities.Membership) (*entities.Membership, error) {
	mm := mappers.MembershipToModel(m)
	if err := r.db.Conn(ctx).Transaction(func(tx *gorm.DB) error { return createWithProperties(tx, mm, m.BusinessIDs) }); err != nil {
		return nil, fmt.Errorf("error creando membresía: %w", err)
	}
	out := mappers.MembershipToDomain(mm, m.BusinessIDs)
	return &out, nil
}

func (r *repository) GetPaymentByReference(ctx context.Context, reference string) (*entities.Payment, error) {
	var pm models.MembershipPayment
	if err := r.db.Conn(ctx).Where("reference = ?", reference).First(&pm).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, fmt.Errorf("error obteniendo pago de membresía: %w", err)
	}
	out := mappers.PaymentToDomain(&pm)
	return &out, nil
}

func (r *repository) GetMembership(ctx context.Context, id uint) (*entities.Membership, error) {
	var mm models.Membership
	if err := r.db.Conn(ctx).Preload("Properties").First(&mm, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, fmt.Errorf("error obteniendo membresía: %w", err)
	}
	out := mappers.MembershipToDomain(&mm, nil)
	return &out, nil
}

// Activate aprueba el pago y activa la membresía. Si el pago ya estaba aprobado no hace nada.
func (r *repository) Activate(ctx context.Context, paymentID, membershipID uint, txn entities.Transaction, startsAt, endsAt time.Time) error {
	return r.db.Conn(ctx).Transaction(func(tx *gorm.DB) error {
		res := tx.Model(&models.MembershipPayment{}).
			Where("id = ? AND status <> ?", paymentID, entities.PaymentApproved).
			Updates(map[string]any{"status": entities.PaymentApproved, "provider_transaction_id": txn.ID, "payment_method_type": txn.PaymentMethodType, "paid_at": startsAt})
		if res.Error != nil {
			return fmt.Errorf("error aprobando pago de membresía: %w", res.Error)
		}
		if res.RowsAffected == 0 {
			return nil
		}
		return tx.Model(&models.Membership{}).Where("id = ?", membershipID).
			Updates(map[string]any{"status": entities.MembershipActive, "starts_at": startsAt, "ends_at": endsAt}).Error
	})
}

func (r *repository) UpdatePaymentStatus(ctx context.Context, paymentID uint, txn entities.Transaction) error {
	err := r.db.Conn(ctx).Model(&models.MembershipPayment{}).
		Where("id = ? AND status <> ?", paymentID, entities.PaymentApproved).
		Updates(map[string]any{"status": txn.Status, "provider_transaction_id": txn.ID, "payment_method_type": txn.PaymentMethodType}).Error
	if err != nil {
		return fmt.Errorf("error actualizando pago de membresía: %w", err)
	}
	return nil
}

func (r *repository) ListByOwner(ctx context.Context, userID uint, limit int) ([]entities.Membership, error) {
	var rows []models.Membership
	err := r.db.Conn(ctx).Preload("Properties").Where("owner_user_id = ? AND status <> ?", userID, entities.MembershipPending).
		Order("created_at DESC").Limit(limit).Find(&rows).Error
	if err != nil {
		return nil, fmt.Errorf("error listando membresías del usuario: %w", err)
	}
	return mappers.MembershipsToDomain(rows), nil
}

func (r *repository) ListByBusiness(ctx context.Context, businessID uint, limit int) ([]entities.Membership, error) {
	var rows []models.Membership
	ids := r.db.Conn(ctx).Model(&models.MembershipProperty{}).Select("membership_id").Where("business_id = ?", businessID)
	err := r.db.Conn(ctx).Preload("Properties").Where("id IN (?) AND status <> ?", ids, entities.MembershipPending).
		Order("created_at DESC").Limit(limit).Find(&rows).Error
	if err != nil {
		return nil, fmt.Errorf("error listando membresías de la propiedad: %w", err)
	}
	return mappers.MembershipsToDomain(rows), nil
}

func createWithProperties(tx *gorm.DB, mm *models.Membership, businessIDs []uint) error {
	if err := tx.Omit("Properties").Create(mm).Error; err != nil {
		return err
	}
	rows := make([]models.MembershipProperty, len(businessIDs))
	for i, id := range businessIDs {
		rows[i] = models.MembershipProperty{MembershipID: mm.ID, BusinessID: id}
	}
	return tx.Create(&rows).Error
}
