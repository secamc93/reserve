package horizontalpropertyhandler

import (
	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/shared/log"
)

// HorizontalPropertyHandler maneja las peticiones HTTP para propiedades horizontales
type HorizontalPropertyHandler struct {
	horizontalPropertyUseCase domain.HorizontalPropertyUseCase
	logger                    log.ILogger
}

// NewHorizontalPropertyHandler crea una nueva instancia del handler
func NewHorizontalPropertyHandler(
	horizontalPropertyUseCase domain.HorizontalPropertyUseCase,
	logger log.ILogger,
) *HorizontalPropertyHandler {
	return &HorizontalPropertyHandler{
		horizontalPropertyUseCase: horizontalPropertyUseCase,
		logger:                    logger,
	}
}
