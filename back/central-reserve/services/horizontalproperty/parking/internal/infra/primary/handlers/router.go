package handlers

import (
	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

func (h *ParkingHandler) RegisterRoutes(router *gin.RouterGroup) {
	parking := router.Group("/horizontal-properties/parking")
	{
		// Zonas de parqueo
		zones := parking.Group("/zones")
		{
			zones.POST("", middleware.JWT(), h.CreateParkingZone)
			zones.GET("", middleware.JWT(), h.ListParkingZones)
		}

		// Espacios de parqueo
		slots := parking.Group("/slots")
		{
			slots.POST("", middleware.JWT(), h.CreateParkingSlot)
			slots.GET("", middleware.JWT(), h.ListParkingSlots)
		}

		// Asignaciones permanentes
		assignments := parking.Group("/assignments")
		{
			assignments.POST("", middleware.JWT(), h.AssignParking)
			assignments.GET("", middleware.JWT(), h.ListParkingAssignments)
		}

		// Reservas temporales
		reservations := parking.Group("/reservations")
		{
			reservations.POST("", middleware.JWT(), h.CreateParkingReservation)
			reservations.GET("", middleware.JWT(), h.ListParkingReservations)
			reservations.POST("/:id/check-in", middleware.JWT(), h.CheckInParking)
			reservations.POST("/:id/check-out", middleware.JWT(), h.CheckOutParking)
			reservations.POST("/:id/cancel", middleware.JWT(), h.CancelParkingReservation)
		}

		// Disponibilidad
		parking.POST("/check-availability", middleware.JWT(), h.CheckParkingAvailability)
	}
}
