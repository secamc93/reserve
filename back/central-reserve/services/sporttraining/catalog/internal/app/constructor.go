package app

import (
	"central_reserve/services/sporttraining/catalog/internal/domain"
	"central_reserve/shared/log"
)

type catalogUseCase struct {
	repo   domain.CatalogRepository
	logger log.ILogger
}

// New crea una nueva instancia del caso de uso de catálogos
func New(repo domain.CatalogRepository, logger log.ILogger) domain.CatalogUseCase {
	return &catalogUseCase{
		repo:   repo,
		logger: logger.WithModule("catálogos"),
	}
}
