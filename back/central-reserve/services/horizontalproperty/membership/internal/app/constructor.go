package app

import (
	"time"

	"central_reserve/services/horizontalproperty/membership/internal/domain/ports"
	"central_reserve/shared/log"
)

const (
	currencyCOP = "COP"
	listLimit   = 20
)

type useCase struct {
	repo    ports.IRepository
	gateway ports.IPaymentGateway
	logger  log.ILogger
	now     func() time.Time
}

// New crea los casos de uso de membresías.
func New(repo ports.IRepository, gateway ports.IPaymentGateway, logger log.ILogger) ports.IUseCase {
	return &useCase{repo: repo, gateway: gateway, logger: logger, now: time.Now}
}
