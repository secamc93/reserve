package handlers

import (
	"central_reserve/services/horizontalproperty/parking/internal/domain"
	"central_reserve/shared/log"
)

type ParkingHandler struct {
	useCase domain.ParkingUseCase
	logger  log.ILogger
}

func New(useCase domain.ParkingUseCase, logger log.ILogger) *ParkingHandler {
	contextualLogger := logger.WithModule("parqueaderos")

	return &ParkingHandler{
		useCase: useCase,
		logger:  contextualLogger,
	}
}
