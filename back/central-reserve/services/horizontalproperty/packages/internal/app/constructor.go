package app

import (
	"central_reserve/services/horizontalproperty/packages/internal/domain"
	"central_reserve/shared/log"
)

type packageUseCase struct {
	packageRepo domain.PackageRepository
	logger      log.ILogger
}

// New crea una nueva instancia del caso de uso
func New(
	packageRepo domain.PackageRepository,
	logger log.ILogger,
) domain.PackageUseCase {
	contextualLogger := logger.WithModule("paquetería")
	return &packageUseCase{
		packageRepo: packageRepo,
		logger:      contextualLogger,
	}
}
