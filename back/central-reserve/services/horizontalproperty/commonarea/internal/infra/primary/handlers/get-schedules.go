package handlers

import (
	"net/http"

	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// GetSchedules devuelve el horario semanal de una zona (incluye días cerrados)
func (h *CommonAreaHandler) GetSchedules(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "GetSchedules")

	id, ok := parseIDParam(c, "id")
	if !ok {
		return
	}
	if _, ok := h.loadAreaInScope(c, id); !ok {
		return
	}
	schedules, err := h.useCase.GetSchedules(ctx, id)
	if err != nil {
		h.writeUseCaseError(c, err, "Error obteniendo horarios")
		return
	}
	data := make([]response.ScheduleResponse, len(schedules))
	for i, s := range schedules {
		data[i] = mappers.ScheduleToResponse(s)
	}
	c.JSON(http.StatusOK, response.SuccessResponse{Success: true, Data: data})
}
