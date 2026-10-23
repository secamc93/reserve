package app_test

import (
	"time"

	"central_reserve/services/horizontalproperty/votingbilling/internal/app"
	"central_reserve/services/horizontalproperty/votingbilling/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/ports"
)

const (
	businessID = uint(7)
	price      = int64(50000)
)

var cot = time.FixedZone("COT", -5*60*60)

// now es el jueves 22 de octubre de 2026, 10:00 en Colombia.
var now = time.Date(2026, 10, 22, 10, 0, 0, 0, cot)

func enabled() *mocks.GatewayMock {
	return &mocks.GatewayMock{
		EnabledFn: func() bool { return true },
		CheckoutURLFn: func(r string, _ int64, _, _ string) (string, error) {
			return "https://checkout.wompi.co/p/?reference=" + r, nil
		},
	}
}

func newUseCase(repo ports.IRepository, gw ports.IPaymentGateway) ports.IUseCase {
	return app.New(repo, gw, price, mocks.Logger{})
}
