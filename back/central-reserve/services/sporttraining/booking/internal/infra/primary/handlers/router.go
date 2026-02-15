package handlers

import (
	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

func (h *BookingHandler) RegisterRoutes(router *gin.RouterGroup) {
	bookings := router.Group("/sport-training/bookings")
	{
		bookings.POST("", middleware.JWT(), h.CreateBooking)
		bookings.GET("", middleware.JWT(), h.ListBookings)
		bookings.GET("/:id", middleware.JWT(), h.GetBookingByID)
		bookings.POST("/:id/approve", middleware.JWT(), h.ApproveBooking)
		bookings.POST("/:id/reject", middleware.JWT(), h.RejectBooking)
		bookings.POST("/:id/cancel", middleware.JWT(), h.CancelBooking)
	}
}
