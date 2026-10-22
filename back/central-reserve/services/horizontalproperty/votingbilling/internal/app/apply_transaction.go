package app

import (
	"context"
	"time"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"
	domainerrors "central_reserve/services/horizontalproperty/votingbilling/internal/domain/errors"
	"central_reserve/shared/log"
)

// HandleGatewayEvent procesa un evento de la pasarela (webhook) después de validar su firma.
func (u *useCase) HandleGatewayEvent(ctx context.Context, body []byte) error {
	ctx = log.WithFunctionCtx(ctx, "HandleGatewayEvent")
	tx, err := u.gateway.ParseEvent(body)
	if err != nil {
		return err
	}
	if tx == nil {
		return nil // evento firmado que no es de transacciones
	}
	return u.applyTransaction(ctx, *tx, 0)
}

// applyTransaction lleva el estado de una transacción al pago con su misma referencia. Con
// groupID != 0 exige que el pago sea de ese grupo. No aprueba si el monto o la moneda no
// coinciden, y un pago ya aprobado no cambia (los eventos repetidos no hacen nada).
func (u *useCase) applyTransaction(ctx context.Context, tx entities.Transaction, groupID uint) error {
	payment, err := u.repo.GetPaymentByReference(ctx, tx.Reference)
	if err != nil {
		return err
	}
	if payment == nil {
		return domainerrors.ErrPaymentNotFound
	}
	if groupID != 0 && payment.VotingGroupID != groupID {
		return domainerrors.ErrTransactionMismatch
	}
	if tx.AmountInCents != payment.AmountInCents || tx.Currency != payment.Currency {
		u.logger.Error(ctx).Str("reference", tx.Reference).Int64("expected_cents", payment.AmountInCents).
			Int64("got_cents", tx.AmountInCents).Str("currency", tx.Currency).Msg("Transacción con monto o moneda distintos al pago")
		return domainerrors.ErrTransactionMismatch
	}
	if payment.Status == entities.StatusApproved {
		return nil
	}

	var paidAt *time.Time
	if tx.Status == entities.StatusApproved {
		now := u.now()
		paidAt = &now
	}
	if err := u.repo.UpdatePaymentFromTransaction(ctx, payment.ID, tx, paidAt); err != nil {
		return err
	}
	u.logger.Info(ctx).Str("reference", tx.Reference).Str("status", tx.Status).Str("transaction_id", tx.ID).Msg("Pago actualizado desde la pasarela")
	return nil
}
