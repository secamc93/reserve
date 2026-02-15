package handlers

import (
	"central_reserve/services/sporttraining/player/internal/domain"
	"central_reserve/shared/log"
)

type PlayerHandler struct {
	useCase domain.PlayerUseCase
	logger  log.ILogger
}

func New(useCase domain.PlayerUseCase, logger log.ILogger) *PlayerHandler {
	return &PlayerHandler{
		useCase: useCase,
		logger:  logger.WithModule("jugadores-handler"),
	}
}
