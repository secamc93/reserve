package handlers

import (
	"central_reserve/services/sporttraining/guardian/internal/domain"
	"central_reserve/shared/log"
)

type GuardianHandler struct {
	useCase domain.GuardianUseCase
	logger  log.ILogger
}

func New(useCase domain.GuardianUseCase, logger log.ILogger) *GuardianHandler {
	return &GuardianHandler{
		useCase: useCase,
		logger:  logger.WithModule("tutores-handler"),
	}
}
