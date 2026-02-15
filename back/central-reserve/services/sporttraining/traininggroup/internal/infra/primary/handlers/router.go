package handlers

import (
	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

func (h *GroupHandler) RegisterRoutes(router *gin.RouterGroup) {
	groups := router.Group("/sport-training/groups")
	{
		groups.POST("", middleware.JWT(), h.CreateGroup)
		groups.GET("", middleware.JWT(), h.ListGroups)
		groups.GET("/:id", middleware.JWT(), h.GetGroupByID)
		groups.PUT("/:id", middleware.JWT(), h.UpdateGroup)
		groups.POST("/:id/players", middleware.JWT(), h.AddPlayerToGroup)
		groups.DELETE("/:id/players/:player_id", middleware.JWT(), h.RemovePlayerFromGroup)
		groups.GET("/:id/players", middleware.JWT(), h.GetGroupPlayers)
	}
}
