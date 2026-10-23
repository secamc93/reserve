package app

import (
	"context"
	"time"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/dtos"
	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"
	domainerrors "central_reserve/services/horizontalproperty/votingbilling/internal/domain/errors"
	"central_reserve/shared/log"
)

// ApplyGatewayTransaction aplica una transacción de la pasarela (webhook) al pago con su referencia.
func (u *useCase) ApplyGatewayTransaction(ctx context.Context, tx entities.Transaction) error {
	ctx = log.WithFunctionCtx(ctx, "ApplyGatewayTransaction")
	payment, err := u.repo.GetDayPaymentByReference(ctx, tx.Reference)
	if err != nil {
		return err
	}
	if payment == nil {
		return domainerrors.ErrPaymentNotFound
	}
	return u.apply(ctx, payment, tx)
}

// SyncTransaction consulta a la pasarela una transacción de la propiedad (al volver del pago) y la
// aplica. Cubre el caso en que el webhook no llega (local) o llega tarde.
func (u *useCase) SyncTransaction(ctx context.Context, businessID uint, transactionID string, now time.Time) (*dtos.Coverage, error) {
	ctx = log.WithFunctionCtx(ctx, "SyncTransaction")
	if !u.gateway.Enabled() {
		return nil, domainerrors.ErrGatewayNotConfigured
	}
	tx, err := u.gateway.GetTransaction(ctx, transactionID)
	if err != nil {
		return nil, err
	}
	payment, err := u.repo.GetDayPaymentByReference(ctx, tx.Reference)
	if err != nil {
		return nil, err
	}
	if payment == nil {
		return nil, domainerrors.ErrPaymentNotFound
	}
	if payment.BusinessID != businessID {
		return nil, domainerrors.ErrTransactionMismatch
	}
	if err := u.apply(ctx, payment, *tx); err != nil {
		return nil, err
	}
	return u.GetCoverage(ctx, businessID, now)
}

// apply no aprueba si el monto o la moneda no coinciden, y un pago ya aprobado no cambia (los
// eventos repetidos no hacen nada).
func (u *useCase) apply(ctx context.Context, payment *entities.DayPayment, tx entities.Transaction) error {
	if tx.AmountInCents != payment.AmountInCents || tx.Currency != payment.Currency {
		u.logger.Error(ctx).Str("reference", tx.Reference).Int64("expected_cents", payment.AmountInCents).
			Int64("got_cents", tx.AmountInCents).Str("currency", tx.Currency).Msg("Transacción con monto o moneda distintos al pago")
		return domainerrors.ErrTransactionMismatch
	}
	if payment.Status == entities.StatusApproved {
		return nil
	}
	if tx.Status == entities.StatusApproved {
		if err := u.repo.ApproveDayPayment(ctx, payment.ID, tx, u.now()); err != nil {
			return err
		}
	} else if err := u.repo.UpdateDayPaymentStatus(ctx, payment.ID, tx); err != nil {
		return err
	}
	u.logger.Info(ctx).Str("reference", tx.Reference).Str("status", tx.Status).Str("transaction_id", tx.ID).Msg("Compra de días actualizada desde la pasarela")
	return nil
}
