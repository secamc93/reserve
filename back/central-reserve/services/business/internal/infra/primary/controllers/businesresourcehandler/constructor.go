package businesresourcehandler

import (
	"central_reserve/services/business/internal/app/usecasebusinesstyperesource"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

type IBusinessResourceHandler interface {
	GetBusinessTypesWithResources(c *gin.Context)
	UpdateBusinessTypeResources(c *gin.Context)
	GetBusinessConfiguredResources(c *gin.Context)
	UpdateBusinessConfiguredResources(c *gin.Context)
	SetupRoutes(router *gin.RouterGroup)
}

type businessResourceHandler struct {
	businessTypeResourceUseCase usecasebusinesstyperesource.IUseCaseBusinessTypeResource
	logger                      log.ILogger
}

func New(businessTypeResourceUseCase usecasebusinesstyperesource.IUseCaseBusinessTypeResource, logger log.ILogger) *businessResourceHandler {
	return &businessResourceHandler{
		businessTypeResourceUseCase: businessTypeResourceUseCase,
		logger:                      logger,
	}
}

// SetupRoutes configura las rutas para los recursos de tipos de negocio
func (h *businessResourceHandler) SetupRoutes(router *gin.RouterGroup) {
	// Ruta para obtener todos los tipos de negocio con recursos (paginado)
	router.GET("/business-types/resources", h.GetBusinessTypesWithResources)

	// Rutas para recursos de tipos de negocio específicos
	businessTypeRoutes := router.Group("/business-types/:business_type_id")
	{
		businessTypeRoutes.PUT("/resources", h.UpdateBusinessTypeResources)
	}

	// Rutas para recursos configurados de business específicos
	businessRoutes := router.Group("/businesses/:business_id")
	{
		businessRoutes.GET("/configured-resources", h.GetBusinessConfiguredResources)
		businessRoutes.PUT("/configured-resources", h.UpdateBusinessConfiguredResources)
	}
}
