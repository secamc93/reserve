package handlers

import (
	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

func (h *CoachHandler) RegisterRoutes(router *gin.RouterGroup) {
	coaches := router.Group("/sport-training/coaches")
	{
		coaches.POST("", middleware.JWT(), h.CreateCoach)
		coaches.GET("", middleware.JWT(), h.ListCoaches)
		coaches.GET("/:id", middleware.JWT(), h.GetCoachByID)
		coaches.PUT("/:id", middleware.JWT(), h.UpdateCoach)
		coaches.POST("/:id/specialties", middleware.JWT(), h.AssignSpecialty)
	}
}
