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
		commonAreas.GET("/units", middleware.JWT(), h.SearchUnits)
		commonAreas.GET("/:id", middleware.JWT(), h.GetCommonAreaByID)
		commonAreas.PUT("/:id", middleware.JWT(), h.UpdateCommonArea)
		commonAreas.DELETE("/:id", middleware.JWT(), h.DeleteCommonArea)

		// Horario semanal y bloqueos de una zona
		commonAreas.GET("/:id/schedules", middleware.JWT(), h.GetSchedules)
		commonAreas.PUT("/:id/schedules", middleware.JWT(), h.SetSchedules)
		commonAreas.GET("/:id/restrictions", middleware.JWT(), h.ListRestrictions)
		commonAreas.POST("/:id/restrictions", middleware.JWT(), h.CreateRestriction)
		commonAreas.DELETE("/:id/restrictions/:restrictionId", middleware.JWT(), h.DeleteRestriction)

		// Reservas
		reservations := commonAreas.Group("/reservations")
		{
			reservations.POST("", middleware.JWT(), h.CreateReservation)
			reservations.GET("", middleware.JWT(), h.ListReservations)
			reservations.GET("/:id", middleware.JWT(), h.GetReservationByID)
			reservations.POST("/:id/approve", middleware.JWT(), h.ApproveReservation)
			reservations.POST("/:id/reject", middleware.JWT(), h.RejectReservation)
			reservations.POST("/:id/confirm", middleware.JWT(), h.ConfirmReservation)
			reservations.PUT("/:id/payments", middleware.JWT(), h.UpdateReservationPayments)
			reservations.POST("/:id/check-in", middleware.JWT(), h.CheckInReservation)
			reservations.POST("/:id/check-out", middleware.JWT(), h.CheckOutReservation)
			reservations.POST("/:id/cancel", middleware.JWT(), h.CancelReservation)
		}

		// Disponibilidad
		commonAreas.POST("/check-availability", middleware.JWT(), h.CheckAvailability)
	}
}
