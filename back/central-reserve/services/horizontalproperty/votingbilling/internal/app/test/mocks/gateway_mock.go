package mocks

import (
	"context"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/dtos"
	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"
)

// GatewayMock implementa ports.IPaymentGateway con un Func por método; si es nil devuelve ceros.
type GatewayMock struct {
	EnabledFn        func() bool
	CheckoutURLFn    func(params dtos.CheckoutParams) (string, error)
	ParseEventFn     func(body []byte) (*entities.Transaction, error)
	GetTransactionFn func(ctx context.Context, transactionID string) (*entities.Transaction, error)
}

func (m *GatewayMock) Enabled() bool {
	if m.EnabledFn != nil {
		return m.EnabledFn()
	}
	return false
}

func (m *GatewayMock) CheckoutURL(params dtos.CheckoutParams) (string, error) {
	if m.CheckoutURLFn != nil {
		return m.CheckoutURLFn(params)
	}
	return "", nil
}

func (m *GatewayMock) ParseEvent(body []byte) (*entities.Transaction, error) {
	if m.ParseEventFn != nil {
		return m.ParseEventFn(body)
	}
	return nil, nil
}

func (m *GatewayMock) GetTransaction(ctx context.Context, transactionID string) (*entities.Transaction, error) {
	if m.GetTransactionFn != nil {
		return m.GetTransactionFn(ctx, transactionID)
	}
	return nil, nil
}
