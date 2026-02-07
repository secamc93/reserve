package handlers

import (
	"central_reserve/services/sporttraining/coach/internal/domain"
	"central_reserve/shared/log"
)

type CoachHandler struct {
	useCase domain.CoachUseCase
	logger  log.ILogger
}

func New(useCase domain.CoachUseCase, logger log.ILogger) *CoachHandler {
	return &CoachHandler{
		useCase: useCase,
		logger:  logger.WithModule("entrenadores-handler"),
	}
}
