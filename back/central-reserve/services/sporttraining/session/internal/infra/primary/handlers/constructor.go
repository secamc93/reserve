package handlers

import (
	"central_reserve/services/sporttraining/session/internal/domain"
	"central_reserve/shared/log"
)

type SessionHandler struct {
	useCase domain.SessionUseCase
	logger  log.ILogger
}

func New(useCase domain.SessionUseCase, logger log.ILogger) *SessionHandler {
	return &SessionHandler{
		useCase: useCase,
		logger:  logger.WithModule("sesiones-handler"),
	}
}
