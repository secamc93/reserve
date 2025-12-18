package handlers

import (
	"central_reserve/services/horizontalproperty/packages/internal/domain"
	"central_reserve/shared/log"
)

type PackageHandler struct {
	useCase domain.PackageUseCase
	logger  log.ILogger
}

func New(useCase domain.PackageUseCase, logger log.ILogger) *PackageHandler {
	contextualLogger := logger.WithModule("paquetería")

	return &PackageHandler{
		useCase: useCase,
		logger:  contextualLogger,
	}
}
