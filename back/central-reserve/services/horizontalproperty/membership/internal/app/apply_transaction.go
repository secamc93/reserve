package app

import (
	"context"

	"central_reserve/services/horizontalproperty/membership/internal/domain/dtos"
	"central_reserve/services/horizontalproperty/membership/internal/domain/entities"
	domainerrors "central_reserve/services/horizontalproperty/membership/internal/domain/errors"
	"central_reserve/shared/log"
)

// ApplyGatewayTransaction aplica una transacción de la pasarela (webhook) al pago con su referencia.
func (u *useCase) ApplyGatewayTransaction(ctx context.Context, tx entities.Transaction) error {
	ctx = log.WithFunctionCtx(ctx, "ApplyGatewayTransaction")
	p, err := u.repo.GetPaymentByReference(ctx, tx.Reference)
	if err != nil {
		return err
	}
	if p == nil {
		return domainerrors.ErrPaymentNotFound
	}
	return u.apply(ctx, p, tx)
}

// SyncTransaction consulta una transacción a la pasarela al volver del pago y la aplica. Solo el
// dueño de la membresía (o el super admin) puede confirmarla.
func (u *useCase) SyncTransaction(ctx context.Context, req dtos.SyncRequest) (*entities.Membership, error) {
	ctx = log.WithFunctionCtx(ctx, "SyncTransaction")
	if !u.gateway.Enabled() {
		return nil, domainerrors.ErrGatewayNotConfigured
	}
	tx, err := u.gateway.GetTransaction(ctx, req.TransactionID)
	if err != nil {
		return nil, err
	}
	p, err := u.repo.GetPaymentByReference(ctx, tx.Reference)
	if err != nil {
		return nil, err
	}
	if p == nil {
		return nil, domainerrors.ErrPaymentNotFound
	}
	m, err := u.repo.GetMembership(ctx, p.MembershipID)
	if err != nil {
		return nil, err
	}
	if m == nil || (!req.IsSuperAdmin && (m.OwnerUserID == nil || *m.OwnerUserID != req.UserID)) {
		return nil, domainerrors.ErrTransactionMismatch
	}
	if err := u.apply(ctx, p, *tx); err != nil {
		return nil, err
	}
	return u.repo.GetMembership(ctx, p.MembershipID)
}

// apply no activa si el monto o la moneda no coinciden; un pago ya aprobado no cambia. La membresía
// cuenta sus 30 días desde la aprobación.
func (u *useCase) apply(ctx context.Context, p *entities.Payment, tx entities.Transaction) error {
	if tx.AmountInCents != p.AmountInCents || tx.Currency != p.Currency {
		u.logger.Error(ctx).Str("reference", tx.Reference).Int64("expected_cents", p.AmountInCents).Int64("got_cents", tx.AmountInCents).Msg("Transacción con monto o moneda distintos a la membresía")
		return domainerrors.ErrTransactionMismatch
	}
	if p.Status == entities.PaymentApproved {
		return nil
	}
	if tx.Status != entities.PaymentApproved {
		return u.repo.UpdatePaymentStatus(ctx, p.ID, tx)
	}
	start, end := entities.Period(u.now())
	if err := u.repo.Activate(ctx, p.ID, p.MembershipID, tx, start, end); err != nil {
		return err
	}
	u.logger.Info(ctx).Str("reference", tx.Reference).Uint("membership_id", p.MembershipID).Msg("Membresía activada")
	return nil
}
