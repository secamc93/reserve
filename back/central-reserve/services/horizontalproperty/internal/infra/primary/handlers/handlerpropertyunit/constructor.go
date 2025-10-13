package handlerpropertyunit

import (
	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/shared/log"
)

type PropertyUnitHandler struct {
	useCase domain.PropertyUnitUseCase
	logger  log.ILogger
}

func New(useCase domain.PropertyUnitUseCase, logger log.ILogger) *PropertyUnitHandler {
	return &PropertyUnitHandler{
		useCase: useCase,
		logger:  logger,
	}
}
