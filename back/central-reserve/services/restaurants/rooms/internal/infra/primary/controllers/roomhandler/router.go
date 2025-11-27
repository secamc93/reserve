package roomhandler

import (
	"central_reserve/services/auth/middleware"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registra las rutas del handler de salas
func RegisterRoutes(router *gin.RouterGroup, handler IRoomHandler, logger log.ILogger) {
	rooms := router.Group("/rooms")

	{
		rooms.POST("", middleware.JWT(), handler.CreateRoomHandler)
		rooms.GET("", middleware.JWT(), handler.GetRoomsHandler)
		rooms.GET("/:id", middleware.JWT(), handler.GetRoomByIDHandler)
		rooms.PUT("/:id", middleware.JWT(), handler.UpdateRoomHandler)
		rooms.DELETE("/:id", middleware.JWT(), handler.DeleteRoomHandler)
	}

	businessRooms := router.Group("/business-rooms")
	{
		businessRooms.GET("/:business_id", middleware.JWT(), handler.GetRoomsByBusinessHandler)
	}
}
