package clienthandler

import (
	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(v1Group *gin.RouterGroup, handler IClientHandler) {
	clients := v1Group.Group("/clients")
	{
		clients.GET("", middleware.JWT(), handler.GetClientsHandler)
		clients.GET("/:id", middleware.JWT(), handler.GetClientByIDHandler)
		clients.POST("", middleware.JWT(), handler.CreateClientHandler)
		clients.PUT("/:id", middleware.JWT(), handler.UpdateClientHandler)
		clients.DELETE("/:id", middleware.JWT(), handler.DeleteClientHandler)
	}
}
