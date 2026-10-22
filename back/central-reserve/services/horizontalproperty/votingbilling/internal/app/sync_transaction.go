package app

import (
	"context"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/dtos"
	domainerrors "central_reserve/services/horizontalproperty/votingbilling/internal/domain/errors"
	"central_reserve/shared/log"
)

// SyncTransaction consulta a la pasarela una transacción del grupo (al volver del pago) y aplica
// su estado. Cubre el caso en que el webhook no llega (p. ej. en local) o llega tarde.
func (u *useCase) SyncTransaction(ctx context.Context, businessID, groupID uint, transactionID string) (*dtos.BillingStatus, error) {
	ctx = log.WithFunctionCtx(ctx, "SyncTransaction")

	group, err := u.ownedGroup(ctx, businessID, groupID)
	if err != nil {
		return nil, err
	}
	if !u.gateway.Enabled() {
		return nil, domainerrors.ErrGatewayNotConfigured
	}
	tx, err := u.gateway.GetTransaction(ctx, transactionID)
	if err != nil {
		return nil, err
	}
	if err := u.applyTransaction(ctx, *tx, group.ID); err != nil {
		return nil, err
	}
	return u.status(ctx, group)
}
