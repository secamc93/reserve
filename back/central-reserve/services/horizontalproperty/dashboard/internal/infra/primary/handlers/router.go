package handlers

import (
	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registra las rutas del dashboard
func (h *DashboardHandler) RegisterRoutes(router *gin.RouterGroup) {
	dashboard := router.Group("/dashboard")
	{
		dashboard.GET("", middleware.JWT(), h.GetDashboard)
	}
}

