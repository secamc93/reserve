package handlers

import (
	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

func (h *SessionHandler) RegisterRoutes(router *gin.RouterGroup) {
	sessions := router.Group("/sport-training/sessions")
	{
		sessions.POST("", middleware.JWT(), h.CreateSession)
		sessions.GET("", middleware.JWT(), h.ListSessions)
		sessions.GET("/:id", middleware.JWT(), h.GetSessionByID)
		sessions.PUT("/:id", middleware.JWT(), h.UpdateSession)
		sessions.PUT("/:id/cancel", middleware.JWT(), h.CancelSession)
	}
}
