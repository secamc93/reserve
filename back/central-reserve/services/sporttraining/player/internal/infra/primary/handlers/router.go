package handlers

import (
	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

func (h *PlayerHandler) RegisterRoutes(router *gin.RouterGroup) {
	players := router.Group("/sport-training/players")
	{
		players.POST("", middleware.JWT(), h.CreatePlayer)
		players.GET("", middleware.JWT(), h.ListPlayers)
		players.GET("/:id", middleware.JWT(), h.GetPlayerByID)
		players.PUT("/:id", middleware.JWT(), h.UpdatePlayer)
		players.DELETE("/:id", middleware.JWT(), h.DeletePlayer)
	}
}
