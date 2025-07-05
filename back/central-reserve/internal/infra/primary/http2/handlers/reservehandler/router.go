package reservehandler

import (
	"github.com/gin-gonic/gin"
)

// RegisterRoutes registra las rutas del handler de reservas
func RegisterRoutes(v1Group *gin.RouterGroup, handler IReserveHandler) {
	// Crear el subgrupo /reserves dentro de /api/v1
	reserves := v1Group.Group("/reserves")
	{
		reserves.GET("", handler.GetReservesHandler)
		reserves.GET("/:id", handler.GetReserveByIDHandler)
		reserves.POST("", handler.CreateReserveHandler)
		reserves.PUT("/:id", handler.UpdateReservationHandler)
		reserves.PATCH("/:id/cancel", handler.CancelReservationHandler)
	}
}
