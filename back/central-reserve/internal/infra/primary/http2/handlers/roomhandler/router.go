package roomhandler

import (
	"central_reserve/internal/domain/ports"
	"central_reserve/internal/infra/primary/http2/middleware"
	"central_reserve/internal/pkg/log"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registra las rutas del handler de salas
func RegisterRoutes(router *gin.RouterGroup, handler IRoomHandler, jwtService ports.IJWTService, logger log.ILogger) {
	// Crear el subgrupo /rooms dentro de /api/v1
	rooms := router.Group("/rooms")
	// Aplicar middleware de autenticación a todas las rutas de salas
	rooms.Use(middleware.AuthMiddleware(jwtService, logger))
	{
		rooms.POST("", handler.CreateRoomHandler)
		rooms.GET("", handler.GetRoomsHandler)
		rooms.GET("/:id", handler.GetRoomByIDHandler)
		rooms.PUT("/:id", handler.UpdateRoomHandler)
		rooms.DELETE("/:id", handler.DeleteRoomHandler)
	}

	// Rutas específicas por negocio (también protegidas)
	// Usar un grupo diferente para evitar conflictos con las rutas de business
	businessRooms := router.Group("/business-rooms")
	businessRooms.Use(middleware.AuthMiddleware(jwtService, logger))
	{
		businessRooms.GET("/:business_id", handler.GetRoomsByBusinessHandler)
	}
}
