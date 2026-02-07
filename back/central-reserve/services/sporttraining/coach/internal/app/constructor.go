package app

import (
	"central_reserve/services/sporttraining/coach/internal/domain"
	"central_reserve/shared/log"
)

type coachUseCase struct {
	repo   domain.CoachRepository
	logger log.ILogger
}

// New crea una nueva instancia del caso de uso de entrenadores
func New(repo domain.CoachRepository, logger log.ILogger) domain.CoachUseCase {
	return &coachUseCase{
		repo:   repo,
		logger: logger.WithModule("entrenadores"),
	}
}
