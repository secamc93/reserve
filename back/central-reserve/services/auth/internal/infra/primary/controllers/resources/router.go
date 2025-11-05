package resources

import (
	"central_reserve/services/auth/middleware"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registra las rutas del handler de Resource
func RegisterRoutes(router *gin.RouterGroup, handler IResourceHandler, logger log.ILogger) {
	resources := router.Group("/resources")

	// Rutas de Resource CRUD
	resources.GET("", middleware.JWT(), handler.GetResourcesHandler)
	resources.GET("/:id", middleware.JWT(), handler.GetResourceByIDHandler)
	resources.POST("", middleware.JWT(), handler.CreateResourceHandler)
	resources.PUT("/:id", middleware.JWT(), handler.UpdateResourceHandler)
	resources.DELETE("/:id", middleware.JWT(), handler.DeleteResourceHandler)
}
