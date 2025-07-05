package clienthandler

import (
	"github.com/gin-gonic/gin"
)

// RegisterRoutes registra las rutas del handler de clientes
func RegisterRoutes(v1Group *gin.RouterGroup, handler IClientHandler) {
	// Crear el subgrupo /clients dentro de /api/v1
	clients := v1Group.Group("/clients")
	{
		clients.GET("", handler.GetClientsHandler)
		clients.GET("/:id", handler.GetClientByIDHandler)
		clients.POST("", handler.CreateClientHandler)
		clients.PUT("/:id", handler.UpdateClientHandler)
		clients.DELETE("/:id", handler.DeleteClientHandler)
	}
}
