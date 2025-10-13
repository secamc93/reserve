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
	return &ResidentHandler{
		useCase: useCase,
		logger:  logger,
	}
}
