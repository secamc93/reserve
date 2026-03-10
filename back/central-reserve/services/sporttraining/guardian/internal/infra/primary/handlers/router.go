package handlers

import (
	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

func (h *GuardianHandler) RegisterRoutes(router *gin.RouterGroup) {
	guardians := router.Group("/sport-training/guardians")
	{
		guardians.POST("", middleware.JWT(), h.CreateGuardian)
		guardians.GET("", middleware.JWT(), h.ListGuardians)
		guardians.GET("/:id", middleware.JWT(), h.GetGuardianByID)
		guardians.PUT("/:id", middleware.JWT(), h.UpdateGuardian)
	}

	players := router.Group("/sport-training/players")
	{
		players.POST("/:id/guardians", middleware.JWT(), h.AssignGuardianToPlayer)
		players.GET("/:id/guardians", middleware.JWT(), h.GetPlayerGuardians)
	}
}
