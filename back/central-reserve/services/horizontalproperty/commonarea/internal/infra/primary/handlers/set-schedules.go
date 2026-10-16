package handlers

import (
	"net/http"

	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// SetSchedules guarda el horario semanal de una zona
func (h *CommonAreaHandler) SetSchedules(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "SetSchedules")

	id, ok := parseIDParam(c, "id")
	if !ok {
		return
	}
	var req request.SetSchedulesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Datos inválidos", Error: err.Error()})
		return
	}
	if _, ok := h.loadAreaInScope(c, id); !ok {
		return
	}

	input := make([]domain.ScheduleInputDTO, len(req.Schedules))
	for i, s := range req.Schedules {
		input[i] = domain.ScheduleInputDTO{DayOfWeek: s.DayOfWeek, StartTime: s.StartTime, EndTime: s.EndTime, IsActive: s.IsActive}
	}
	schedules, err := h.useCase.SetSchedules(ctx, id, input)
	if err != nil {
		h.writeUseCaseError(c, err, "Error guardando horarios")
		return
	}
	data := make([]response.ScheduleResponse, len(schedules))
	for i, s := range schedules {
		data[i] = mappers.ScheduleToResponse(s)
	}
	c.JSON(http.StatusOK, response.SuccessResponse{Success: true, Message: "Horario guardado", Data: data})
}
