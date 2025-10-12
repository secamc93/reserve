package handlerpropertyunit

import (
	"central_reserve/services/horizontalproperty/internal/domain"

	"github.com/gin-gonic/gin"
)

type PropertyUnitHandler struct {
	useCase domain.PropertyUnitUseCase
}

func New(useCase domain.PropertyUnitUseCase) *PropertyUnitHandler {
	return &PropertyUnitHandler{
		useCase: useCase,
	}
}

func (h *PropertyUnitHandler) RegisterRoutes(router *gin.RouterGroup) {
	units := router.Group("/horizontal-properties/:hp_id/property-units")
	{
		units.POST("", h.CreatePropertyUnit)
		units.GET("", h.ListPropertyUnits)
		units.GET("/:unit_id", h.GetPropertyUnitByID)
		units.PUT("/:unit_id", h.UpdatePropertyUnit)
		units.DELETE("/:unit_id", h.DeletePropertyUnit)
	}
}
