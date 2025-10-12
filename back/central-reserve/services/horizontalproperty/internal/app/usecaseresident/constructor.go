package usecaseresident

import (
	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/shared/log"
)

type residentUseCase struct {
	repo   domain.ResidentRepository
	logger log.ILogger
}

// New crea una nueva instancia del caso de uso
func New(repo domain.ResidentRepository, logger log.ILogger) domain.ResidentUseCase {
	return &residentUseCase{
		repo:   repo,
		logger: logger,
	}
}
