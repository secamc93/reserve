package handlers

import (
	"central_reserve/services/auth/middleware"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registra las rutas del dashboard
func (h *handlers) RegisterRoutes(router *gin.RouterGroup, handler Ihandlers, logger log.ILogger) {
	dashboardGroup := router.Group("/dashboard")
	{
		dashboardGroup.GET("/stats", middleware.JWT(), handler.GetDashboardStatsHandler)
	}
}


