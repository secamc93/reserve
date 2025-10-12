package usecasepropertyunit

import (
	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/shared/log"
)

type propertyUnitUseCase struct {
	repo   domain.PropertyUnitRepository
	logger log.ILogger
}

// New crea una nueva instancia del caso de uso
func New(repo domain.PropertyUnitRepository, logger log.ILogger) domain.PropertyUnitUseCase {
	return &propertyUnitUseCase{
		repo:   repo,
		logger: logger,
	}
}
