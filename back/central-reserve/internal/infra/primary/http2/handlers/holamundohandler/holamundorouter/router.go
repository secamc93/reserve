package holamundorouter

import (
	"central_reserve/internal/infra/primary/http2/handlers/holamundohandler"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registra las rutas del handler en el grupo /api/v1
func Routes(v1Group *gin.RouterGroup, handler holamundohandler.IHolaMundoHandler) {
	// Crear el subgrupo /holamundo dentro de /api/v1
	holamundo := v1Group.Group("/holamundo")
	{
		holamundo.GET("", handler.GetHolaMundo)
		holamundo.GET("/saludo", handler.GetSaludo)
		holamundo.POST("/reserve", handler.CreateReserveHandler)
	}
}
