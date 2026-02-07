package app

import (
	"central_reserve/services/sporttraining/booking/internal/domain"
	"central_reserve/shared/log"
)

type bookingUseCase struct {
	repo   domain.BookingRepository
	logger log.ILogger
}

// New crea una nueva instancia del caso de uso de reservas
func New(repo domain.BookingRepository, logger log.ILogger) domain.BookingUseCase {
	return &bookingUseCase{
		repo:   repo,
		logger: logger.WithModule("reservas"),
	}
}
