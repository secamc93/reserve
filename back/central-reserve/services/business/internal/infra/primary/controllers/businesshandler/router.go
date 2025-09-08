package businesshandler

import (
	"central_reserve/services/auth/middleware"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registra las rutas del handler de Business
func RegisterRoutes(router *gin.RouterGroup, handler IBusinessHandler, logger log.ILogger) {
	businesses := router.Group("/businesses")

	// Rutas de Business
	businesses.GET("", middleware.JWT(), handler.GetBusinesses)
	businesses.GET("/:id", middleware.JWT(), handler.GetBusinessByIDHandler)
	businesses.POST("", middleware.JWT(), handler.CreateBusinessHandler)
	businesses.PUT("/:id", middleware.JWT(), handler.UpdateBusinessHandler)
	businesses.DELETE("/:id", middleware.JWT(), handler.DeleteBusinessHandler)
	businesses.GET("/:id/resources", middleware.JWT(), handler.GetBusinessResourcesHandler)
	businesses.GET("/:id/resources/:resource", middleware.JWT(), handler.GetBusinessResourceStatusHandler)
}
