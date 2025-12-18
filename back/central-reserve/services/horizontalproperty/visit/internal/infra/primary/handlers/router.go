package handlers

import (
	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

func (h *VisitHandler) RegisterRoutes(router *gin.RouterGroup) {
	visits := router.Group("/horizontal-properties/visits")
	{
		visits.POST("", middleware.JWT(), h.CreateVisit)
		visits.GET("/search-visitor", middleware.JWT(), h.SearchVisitor)
		visits.POST("/visitors", middleware.JWT(), h.CreateVisitor)
		visits.GET("/qr/:qr_code", middleware.JWT(), h.GetVisitByQRCode)
		visits.POST("/:visit_id/register-entry", middleware.JWT(), h.RegisterEntry)
		visits.POST("/:visit_id/register-exit", middleware.JWT(), h.RegisterExit)
		visits.POST("/:visit_id/assets", middleware.JWT(), h.RegisterAssets)
		visits.GET("", middleware.JWT(), h.ListVisits)
		visits.GET("/:visit_id", middleware.JWT(), h.GetVisitByID)
	}
}
