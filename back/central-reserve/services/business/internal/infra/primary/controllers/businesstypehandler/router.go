package businesstypehandler

import (
	"central_reserve/services/auth/middleware"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registra las rutas del handler de BusinessType
func RegisterRoutes(router *gin.RouterGroup, handler IBusinessTypeHandler, logger log.ILogger) {
	businessTypes := router.Group("/business-types")

	// Rutas de BusinessType
	businessTypes.GET("", middleware.JWT(), handler.GetBusinessTypesHandler)
	businessTypes.GET("/:id", middleware.JWT(), handler.GetBusinessTypeByIDHandler)
	businessTypes.POST("", middleware.JWT(), handler.CreateBusinessTypeHandler)
	businessTypes.PUT("/:id", middleware.JWT(), handler.UpdateBusinessTypeHandler)
	businessTypes.DELETE("/:id", middleware.JWT(), handler.DeleteBusinessTypeHandler)
}
