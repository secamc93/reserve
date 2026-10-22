package handlers

import (
	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

func (h *handler) RegisterRoutes(router *gin.RouterGroup) {
	group := router.Group("/horizontal-properties/voting-groups/:group_id")
	{
		group.GET("/payment", middleware.JWT(), h.GetStatus)
		group.POST("/payments/checkout", middleware.JWT(), h.CreateCheckout)
		group.POST("/payments/sync", middleware.JWT(), h.SyncTransaction)
		group.POST("/payments/manual", middleware.JWT(), h.RegisterManualPayment) // solo super admin
	}
	router.PUT("/horizontal-properties/voting-billing/exemption", middleware.JWT(), h.SetExemption) // solo super admin

	// Webhook de Wompi: público, se autentica con la firma del evento.
	router.POST("/payments/wompi/events", h.WompiEvents)
}
