package handlers

import (
	"central_reserve/services/sporttraining/catalog/internal/domain"
	"central_reserve/shared/log"
)

type CatalogHandler struct {
	useCase domain.CatalogUseCase
	logger  log.ILogger
}

func New(useCase domain.CatalogUseCase, logger log.ILogger) *CatalogHandler {
	return &CatalogHandler{
		useCase: useCase,
		logger:  logger.WithModule("catálogos-handler"),
	}
}
