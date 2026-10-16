package handlers

import (
	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

func (h *ResidentHandler) RegisterRoutes(router *gin.RouterGroup) {
	residents := router.Group("/horizontal-properties/residents")
	{
		residents.POST("", middleware.JWT(), h.CreateResident)
		residents.POST("/import-excel", middleware.JWT(), h.ImportResidentsExcel) // Importar residentes desde Excel
		residents.PUT("/bulk-update", middleware.JWT(), h.BulkUpdateResidents)    // Edición masiva de residentes
		residents.GET("", middleware.JWT(), h.ListResidents)
		residents.GET("/summary", middleware.JWT(), h.GetResidentsSummary) // Totales y conteo por tipo
		residents.GET("/:resident_id", middleware.JWT(), h.GetResidentByID)
		residents.GET("/:resident_id/overview", middleware.JWT(), h.GetResidentOverview) // Cifras, unidad y actividad reciente
		residents.PUT("/:resident_id", middleware.JWT(), h.UpdateResident)
		residents.DELETE("/:resident_id", middleware.JWT(), h.DeleteResident)
	}
}
