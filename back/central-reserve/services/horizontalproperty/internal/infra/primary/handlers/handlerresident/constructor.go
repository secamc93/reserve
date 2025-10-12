package handlerresident

import (
	"central_reserve/services/horizontalproperty/internal/domain"
	"github.com/gin-gonic/gin"
)

type ResidentHandler struct {
	useCase domain.ResidentUseCase
}

func New(useCase domain.ResidentUseCase) *ResidentHandler {
	return &ResidentHandler{useCase: useCase}
}

func (h *ResidentHandler) RegisterRoutes(router *gin.RouterGroup) {
	residents := router.Group("/horizontal-properties/:hp_id/residents")
	{
		residents.POST("", h.CreateResident)
		residents.GET("", h.ListResidents)
		residents.GET("/:resident_id", h.GetResidentByID)
		residents.PUT("/:resident_id", h.UpdateResident)
		residents.DELETE("/:resident_id", h.DeleteResident)
	}
}
