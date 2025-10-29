package handlerresident

import (
	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/shared/log"
)

type ResidentHandler struct {
	useCase domain.ResidentUseCase
	logger  log.ILogger
}

func New(useCase domain.ResidentUseCase, logger log.ILogger) *ResidentHandler {
	// El logger ya viene con service="horizontalproperty" desde el bundle
	// Solo agregamos el módulo específico
	contextualLogger := logger.WithModule("residentes")

	return &ResidentHandler{
		useCase: useCase,
		logger:  contextualLogger,
	}
}
