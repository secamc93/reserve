package app

import (
	"time"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/ports"
	"central_reserve/shared/log"
)

// DefaultPricePerDayCOP es el precio de un día de votación cuando no se configura otro.
const DefaultPricePerDayCOP int64 = 50000

const currencyCOP = "COP"

type useCase struct {
	repo           ports.IRepository
	gateway        ports.IPaymentGateway
	pricePerDayCOP int64
	logger         log.ILogger
	now            func() time.Time
}

// New crea los casos de uso del cobro por días de votación. pricePerDayCOP <= 0 usa el precio por
// defecto.
func New(repo ports.IRepository, gateway ports.IPaymentGateway, pricePerDayCOP int64, logger log.ILogger) ports.IUseCase {
	if pricePerDayCOP <= 0 {
		pricePerDayCOP = DefaultPricePerDayCOP
	}
	return &useCase{repo: repo, gateway: gateway, pricePerDayCOP: pricePerDayCOP, logger: logger, now: time.Now}
}
