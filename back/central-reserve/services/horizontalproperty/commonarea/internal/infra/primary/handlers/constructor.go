package handlers

import (
	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/shared/log"
)

type CommonAreaHandler struct {
	useCase domain.CommonAreaUseCase
	logger  log.ILogger
}

func New(useCase domain.CommonAreaUseCase, logger log.ILogger) *CommonAreaHandler {
	contextualLogger := logger.WithModule("zonas_comunes")

	return &CommonAreaHandler{
		useCase: useCase,
		logger:  contextualLogger,
	}
}
