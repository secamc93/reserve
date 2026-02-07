package handlers

import (
	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

func (h *CatalogHandler) RegisterRoutes(router *gin.RouterGroup) {
	catalog := router.Group("/sport-training")
	{
		catalog.GET("/skill-levels", middleware.JWT(), h.GetSkillLevels)
		catalog.GET("/coach-specialties", middleware.JWT(), h.GetCoachSpecialties)
		catalog.GET("/session-types", middleware.JWT(), h.GetSessionTypes)
		catalog.GET("/booking-statuses", middleware.JWT(), h.GetBookingStatuses)
		catalog.GET("/attendance-statuses", middleware.JWT(), h.GetAttendanceStatuses)
	}
}
