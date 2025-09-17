package businesresourcehandler

import (
	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configura las rutas para los recursos de tipos de negocio
func (h *businessResourceHandler) RegisterRoutes(router *gin.RouterGroup, handler IBusinessResourceHandler) {
	// Rutas para recursos de tipos de negocio
	businessResourceRoutes := router.Group("/business-resources")
	{
		businessResourceRoutes.GET("/resources", middleware.JWT(), handler.GetBusinessTypesWithResources)
		businessResourceRoutes.PUT("/:business_type_id/resources", middleware.JWT(), handler.UpdateBusinessTypeResources)
		businessResourceRoutes.GET("/businesses/configured-resources", middleware.JWT(), handler.GetBusinessConfiguredResources)
		businessResourceRoutes.PUT("/businesses/:business_id/configured-resources", middleware.JWT(), handler.UpdateBusinessConfiguredResources)
	}
}
