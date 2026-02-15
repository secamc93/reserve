package handlers

import (
	"central_reserve/services/sporttraining/traininggroup/internal/domain"
	"central_reserve/shared/log"
)

type GroupHandler struct {
	useCase domain.GroupUseCase
	logger  log.ILogger
}

func New(useCase domain.GroupUseCase, logger log.ILogger) *GroupHandler {
	return &GroupHandler{
		useCase: useCase,
		logger:  logger.WithModule("grupos-entrenamiento-handler"),
	}
}
