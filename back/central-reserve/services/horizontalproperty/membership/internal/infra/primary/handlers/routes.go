package handlers

import (
	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

func (h *handler) RegisterRoutes(router *gin.RouterGroup) {
	g := router.Group("/horizontal-properties/memberships", middleware.JWT())
	{
		g.GET("/plans", h.ListPlans)
		g.GET("", h.ListForBusiness)
		g.GET("/mine", h.ListMine)
		g.POST("/checkout", h.CreateCheckout)
		g.POST("/sync", h.SyncTransaction)
		g.POST("/grant", h.Grant) // solo super admin
	}
}
