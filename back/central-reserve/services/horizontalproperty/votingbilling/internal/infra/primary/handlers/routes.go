package handlers

import (
	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

func (h *handler) RegisterRoutes(router *gin.RouterGroup) {
	billing := router.Group("/horizontal-properties/voting-billing", middleware.JWT())
	{
		billing.GET("/coverage", h.GetCoverage)
		billing.POST("/days/checkout", h.CreateDaysCheckout)
		billing.POST("/days/sync", h.SyncTransaction)
		// Solo super admin
		billing.POST("/days/grant", h.GrantDays)
		billing.PUT("/exemption", h.SetPropertyExemption)
		billing.GET("/admins", h.ListPropertyAdmins)
		billing.PUT("/admin-exemption", h.SetAdminExemption)
	}
}
