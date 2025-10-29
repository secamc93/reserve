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
	// El logger ya viene con service="horizontalproperty" desde el bundle
	// Solo agregamos el módulo específico
	contextualLogger := logger.WithModule("unidades residenciales")

	return &PropertyUnitHandler{
		useCase: useCase,
		logger:  contextualLogger,
	}
}
