package handlerpropertyunit

import (
	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

func (h *PropertyUnitHandler) RegisterRoutes(router *gin.RouterGroup) {
	// Ruta principal: listado con business_id opcional (query)
	router.GET("/horizontal-properties/property-units", middleware.JWT(), h.ListPropertyUnits)

	// Rutas de creación e importación (sin business_id en path)
	router.POST("/horizontal-properties/property-units", middleware.JWT(), h.CreatePropertyUnit)
	router.POST("/horizontal-properties/property-units/import-excel", middleware.JWT(), h.ImportPropertyUnitsExcel)

	// Rutas específicas por unit_id (solo para operaciones individuales)
	units := router.Group("/horizontal-properties/property-units")
	{
		units.GET("/:unit_id", middleware.JWT(), h.GetPropertyUnitByID)
		units.PUT("/:unit_id", middleware.JWT(), h.UpdatePropertyUnit)
		units.DELETE("/:unit_id", middleware.JWT(), h.DeletePropertyUnit)
	}
}
