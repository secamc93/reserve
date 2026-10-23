package gateway

import (
	"context"
	"errors"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"
	domainerrors "central_reserve/services/horizontalproperty/votingbilling/internal/domain/errors"
	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/ports"
	"central_reserve/shared/payments/wompi"
)

type gateway struct {
	client *wompi.Client
}

// New adapta el cliente compartido de Wompi al puerto del módulo.
func New(client *wompi.Client) ports.IPaymentGateway {
	return &gateway{client: client}
}

func (g *gateway) Enabled() bool { return g.client.Enabled() }

func (g *gateway) CheckoutURL(reference string, amountInCents int64, currency, redirectURL string) (string, error) {
	u, err := g.client.CheckoutURL(reference, amountInCents, currency, redirectURL)
	if errors.Is(err, wompi.ErrNotConfigured) {
		return "", domainerrors.ErrGatewayNotConfigured
	}
	return u, err
}

func (g *gateway) GetTransaction(ctx context.Context, transactionID string) (*entities.Transaction, error) {
	tx, err := g.client.GetTransaction(ctx, transactionID)
	if err != nil {
		return nil, err
	}
	out := entities.Transaction(*tx)
	return &out, nil
}
