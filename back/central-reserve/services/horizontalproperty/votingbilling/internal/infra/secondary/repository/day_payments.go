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

// CreateDayPayment guarda una compra de días (pendiente).
func (r *repository) CreateDayPayment(ctx context.Context, p *entities.DayPayment) (*entities.DayPayment, error) {
	model := mappers.ToModel(p)
	if err := r.db.Conn(ctx).Create(model).Error; err != nil {
		return nil, fmt.Errorf("error creando compra de días: %w", err)
	}
	out := mappers.ToDomain(model)
	return &out, nil
}

// CreateGrantedDays guarda un pago ya aprobado y sus fechas en una transacción.
func (r *repository) CreateGrantedDays(ctx context.Context, p *entities.DayPayment) (*entities.DayPayment, error) {
	model := mappers.ToModel(p)
	err := r.db.Conn(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(model).Error; err != nil {
			return err
		}
		return insertDays(tx, model.ID, p.BusinessID, p.Dates)
	})
	if err != nil {
		return nil, fmt.Errorf("error otorgando días: %w", err)
	}
	out := mappers.ToDomain(model)
	return &out, nil
}

// GetDayPaymentByReference trae la compra con esa referencia, o nil si no existe.
func (r *repository) GetDayPaymentByReference(ctx context.Context, reference string) (*entities.DayPayment, error) {
	var model models.VotingDayPayment
	if err := r.db.Conn(ctx).Where("reference = ?", reference).First(&model).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, fmt.Errorf("error obteniendo compra de días: %w", err)
	}
	out := mappers.ToDomain(&model)
	return &out, nil
}

// ApproveDayPayment marca el pago aprobado y crea sus fechas. Si ya estaba aprobado no hace nada
// (la condición va en la misma consulta para no pisar una aprobación concurrente).
func (r *repository) ApproveDayPayment(ctx context.Context, paymentID uint, txn entities.Transaction, paidAt time.Time) error {
	return r.db.Conn(ctx).Transaction(func(tx *gorm.DB) error {
		res := tx.Model(&models.VotingDayPayment{}).
			Where("id = ? AND status <> ?", paymentID, entities.StatusApproved).
			Updates(map[string]any{
				"status":                  entities.StatusApproved,
				"provider_transaction_id": txn.ID,
				"payment_method_type":     txn.PaymentMethodType,
				"paid_at":                 paidAt,
			})
		if res.Error != nil {
			return fmt.Errorf("error aprobando compra de días: %w", res.Error)
		}
		if res.RowsAffected == 0 {
			return nil
		}
		var model models.VotingDayPayment
		if err := tx.First(&model, paymentID).Error; err != nil {
			return err
		}
		return insertDays(tx, model.ID, model.BusinessID, mappers.SplitDates(model.Dates))
	})
}

// UpdateDayPaymentStatus guarda un estado no aprobado; nunca toca un pago ya aprobado.
func (r *repository) UpdateDayPaymentStatus(ctx context.Context, paymentID uint, txn entities.Transaction) error {
	err := r.db.Conn(ctx).Model(&models.VotingDayPayment{}).
		Where("id = ? AND status <> ?", paymentID, entities.StatusApproved).
		Updates(map[string]any{"status": txn.Status, "provider_transaction_id": txn.ID, "payment_method_type": txn.PaymentMethodType}).Error
	if err != nil {
		return fmt.Errorf("error actualizando compra de días: %w", err)
	}
	return nil
}

// ListRecentDayPayments lista las últimas compras de la propiedad.
func (r *repository) ListRecentDayPayments(ctx context.Context, businessID uint, limit int) ([]entities.DayPayment, error) {
	var rows []models.VotingDayPayment
	if err := r.db.Conn(ctx).Where("business_id = ?", businessID).Order("created_at DESC").Limit(limit).Find(&rows).Error; err != nil {
		return nil, fmt.Errorf("error listando compras de días: %w", err)
	}
	out := make([]entities.DayPayment, len(rows))
	for i := range rows {
		out[i] = mappers.ToDomain(&rows[i])
	}
	return out, nil
}

// insertDays crea las fechas cubiertas; las que ya existen se dejan como están.
func insertDays(tx *gorm.DB, paymentID, businessID uint, dates []string) error {
	if len(dates) == 0 {
		return nil
	}
	rows := make([]models.VotingDay, 0, len(dates))
	for _, d := range dates {
		t, ok := entities.ParseDate(d)
		if !ok {
			return fmt.Errorf("fecha inválida %q", d)
		}
		rows = append(rows, models.VotingDay{BusinessID: businessID, VotingDate: t, PaymentID: paymentID})
	}
	return tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&rows).Error
}
