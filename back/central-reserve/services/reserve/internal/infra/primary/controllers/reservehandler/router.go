package reservehandler

import (
	"central_reserve/services/auth/middleware"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(v1Group *gin.RouterGroup, handler IReserveHandler, logger log.ILogger) {
	reserves := v1Group.Group("/reserves")

	reserves.GET("", middleware.JWT(), handler.GetReservesHandler)
	reserves.GET("/:id", middleware.JWT(), handler.GetReserveByIDHandler)
	reserves.GET("/status", middleware.JWT(), handler.GetReservationStatusesHandler)
	reserves.PUT("/:id", middleware.JWT(), handler.UpdateReservationHandler)
	reserves.PATCH("/:id/cancel", middleware.JWT(), handler.CancelReservationHandler)

	reserves.POST("", middleware.Auto(), handler.CreateReserveHandler)

}
