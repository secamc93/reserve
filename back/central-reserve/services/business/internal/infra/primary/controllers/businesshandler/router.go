package businesshandler

import (
	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registra las rutas del handler de Business
func (h *BusinessHandler) RegisterRoutes(router *gin.RouterGroup, handler IBusinessHandler) {
	businesses := router.Group("/businesses")

	// Rutas de Business
	businesses.GET("", middleware.JWT(), handler.GetBusinesses)
	businesses.GET("/:id", middleware.JWT(), handler.GetBusinessByIDHandler)
	businesses.POST("", middleware.JWT(), handler.CreateBusinessHandler)
	businesses.PUT("/:id", middleware.JWT(), handler.UpdateBusinessHandler)
	businesses.DELETE("/:id", middleware.JWT(), handler.DeleteBusinessHandler)

}
