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
	// El logger ya viene con service="horizontalproperty" desde el bundle
	// Solo agregamos el módulo específico
	contextualLogger := logger.WithModule("propiedad horizontal")

	return &HorizontalPropertyHandler{
		horizontalPropertyUseCase: horizontalPropertyUseCase,
		logger:                    contextualLogger,
	}
}
