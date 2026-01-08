package handlers

import (
	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

func (h *VisitHandler) RegisterRoutes(router *gin.RouterGroup) {
	visits := router.Group("/horizontal-properties/visits")
	{
		// CRUD de visitas
		visits.POST("", middleware.JWT(), h.CreateVisit)
		visits.GET("", middleware.JWT(), h.ListVisits)
		visits.GET("/:visit_id", middleware.JWT(), h.GetVisitByID)
		visits.PUT("/:visit_id", middleware.JWT(), h.UpdateVisit)
		visits.DELETE("/:visit_id", middleware.JWT(), h.DeleteVisit)

		// Tipos y estados
		visits.GET("/types", middleware.JWT(), h.ListVisitTypes)
		visits.GET("/statuses", middleware.JWT(), h.ListVisitStatuses)

		// Visitantes
		visits.GET("/search-visitor", middleware.JWT(), h.SearchVisitor)
		visits.POST("/visitors", middleware.JWT(), h.CreateVisitor)

		// QR
		visits.GET("/qr/:qr_code", middleware.JWT(), h.GetVisitByQRCode)

		// Entrada/Salida
		visits.POST("/:visit_id/register-entry", middleware.JWT(), h.RegisterEntry)
		visits.POST("/:visit_id/register-exit", middleware.JWT(), h.RegisterExit)

		// Activos
		visits.POST("/:visit_id/assets", middleware.JWT(), h.RegisterAssets)

		// Acompañantes
		visits.GET("/:visit_id/companions", middleware.JWT(), h.GetCompanions)
		visits.POST("/:visit_id/companions", middleware.JWT(), h.CreateCompanion)
		visits.DELETE("/:visit_id/companions/:companion_id", middleware.JWT(), h.DeleteCompanion)
	}
}
