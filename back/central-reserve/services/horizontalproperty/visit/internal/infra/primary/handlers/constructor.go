package handlers

import (
	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/shared/log"
)

type VisitHandler struct {
	useCase domain.VisitUseCase
	logger  log.ILogger
}

func New(useCase domain.VisitUseCase, logger log.ILogger) *VisitHandler {
	contextualLogger := logger.WithModule("visitas")

	return &VisitHandler{
		useCase: useCase,
		logger:  contextualLogger,
	}
}
