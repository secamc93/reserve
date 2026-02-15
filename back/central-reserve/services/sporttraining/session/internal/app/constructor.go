package app

import (
	"central_reserve/services/sporttraining/session/internal/domain"
	"central_reserve/shared/log"
)

type sessionUseCase struct {
	repo   domain.SessionRepository
	logger log.ILogger
}

// New crea una nueva instancia del caso de uso de sesiones
func New(repo domain.SessionRepository, logger log.ILogger) domain.SessionUseCase {
	return &sessionUseCase{
		repo:   repo,
		logger: logger.WithModule("sesiones"),
	}
}
