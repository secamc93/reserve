package events

import (
	"context"
	"errors"
	"fmt"

	"central_reserve/services/horizontalproperty/paymentevents/contract"
	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"
	domainerrors "central_reserve/services/horizontalproperty/votingbilling/internal/domain/errors"
	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/ports"
	"central_reserve/shared/payments/wompi"
)

type applier struct {
	useCase ports.IUseCase
}

// New expone las compras de días al webhook único de Wompi (referencias DIA-…).
func New(useCase ports.IUseCase) contract.Applier {
	return &applier{useCase: useCase}
}

func (a *applier) ApplyGatewayTransaction(ctx context.Context, tx wompi.Transaction) error {
	err := a.useCase.ApplyGatewayTransaction(ctx, entities.Transaction(tx))
	if errors.Is(err, domainerrors.ErrPaymentNotFound) || errors.Is(err, domainerrors.ErrTransactionMismatch) {
		return fmt.Errorf("%w: %v", contract.ErrNotApplicable, err)
	}
	return err
}
