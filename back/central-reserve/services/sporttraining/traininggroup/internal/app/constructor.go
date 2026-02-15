package app

import (
	"central_reserve/services/sporttraining/traininggroup/internal/domain"
	"central_reserve/shared/log"
)

type groupUseCase struct {
	repo   domain.GroupRepository
	logger log.ILogger
}

// New crea una nueva instancia del caso de uso de grupos de entrenamiento
func New(repo domain.GroupRepository, logger log.ILogger) domain.GroupUseCase {
	return &groupUseCase{
		repo:   repo,
		logger: logger.WithModule("grupos-entrenamiento"),
	}
}
