package handlerpropertyunit

import (
	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

func (h *PropertyUnitHandler) RegisterRoutes(router *gin.RouterGroup) {
	units := router.Group("/horizontal-properties/:hp_id/property-units")
	{
		units.POST("", middleware.JWT(), h.CreatePropertyUnit)
		units.POST("/import-excel", middleware.JWT(), h.ImportPropertyUnitsExcel) // Importar desde Excel
		units.GET("/:unit_id", middleware.JWT(), h.GetPropertyUnitByID)
		units.PUT("/:unit_id", middleware.JWT(), h.UpdatePropertyUnit)
		units.DELETE("/:unit_id", middleware.JWT(), h.DeletePropertyUnit)
	}

	// Nueva ruta: listado con hp_id opcional (query)
	router.GET("/horizontal-properties/property-units", middleware.JWT(), h.ListPropertyUnitsQuery)
}
