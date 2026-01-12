package handlers

import (
	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

func (h *CommonAreaHandler) RegisterRoutes(router *gin.RouterGroup) {
	commonAreas := router.Group("/horizontal-properties/common-areas")
	{
		// Tipos de zonas comunes
		commonAreas.GET("/types", middleware.JWT(), h.GetCommonAreaTypes)

		// Zonas comunes
		commonAreas.POST("", middleware.JWT(), h.CreateCommonArea)
		commonAreas.GET("", middleware.JWT(), h.ListCommonAreas)
		commonAreas.GET("/:id", middleware.JWT(), h.GetCommonAreaByID)

		// Reservas
		reservations := commonAreas.Group("/reservations")
		{
			reservations.POST("", middleware.JWT(), h.CreateReservation)
			reservations.GET("", middleware.JWT(), h.ListReservations)
			reservations.GET("/:id", middleware.JWT(), h.GetReservationByID)
			reservations.POST("/:id/approve", middleware.JWT(), h.ApproveReservation)
			reservations.POST("/:id/reject", middleware.JWT(), h.RejectReservation)
			reservations.POST("/:id/check-in", middleware.JWT(), h.CheckInReservation)
			reservations.POST("/:id/check-out", middleware.JWT(), h.CheckOutReservation)
			reservations.POST("/:id/cancel", middleware.JWT(), h.CancelReservation)
		}

		// Disponibilidad
		commonAreas.POST("/check-availability", middleware.JWT(), h.CheckAvailability)
	}
}
