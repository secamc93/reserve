package app

import (
	"central_reserve/services/sporttraining/guardian/internal/domain"
	"central_reserve/shared/log"
)

type guardianUseCase struct {
	repo   domain.GuardianRepository
	logger log.ILogger
}

// New crea una nueva instancia del caso de uso de tutores
func New(repo domain.GuardianRepository, logger log.ILogger) domain.GuardianUseCase {
	return &guardianUseCase{
		repo:   repo,
		logger: logger.WithModule("tutores"),
	}
}
