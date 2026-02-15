package handlers

import (
	"central_reserve/services/sporttraining/booking/internal/domain"
	"central_reserve/shared/log"
)

type BookingHandler struct {
	useCase domain.BookingUseCase
	logger  log.ILogger
}

func New(useCase domain.BookingUseCase, logger log.ILogger) *BookingHandler {
	return &BookingHandler{
		useCase: useCase,
		logger:  logger.WithModule("reservas-handler"),
	}
}
