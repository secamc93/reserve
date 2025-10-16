package handlerresident

import (
	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

func (h *ResidentHandler) RegisterRoutes(router *gin.RouterGroup) {
	residents := router.Group("/horizontal-properties/:hp_id/residents")
	{
		residents.POST("", middleware.JWT(), h.CreateResident)
		residents.POST("/import-excel", middleware.JWT(), h.ImportResidentsExcel) // Importar residentes desde Excel
		residents.PUT("/bulk-update", middleware.JWT(), h.BulkUpdateResidents)    // Edición masiva de residentes
		residents.GET("", middleware.JWT(), h.ListResidents)
		residents.GET("/:resident_id", middleware.JWT(), h.GetResidentByID)
		residents.PUT("/:resident_id", middleware.JWT(), h.UpdateResident)
		residents.DELETE("/:resident_id", middleware.JWT(), h.DeleteResident)
	}
}
