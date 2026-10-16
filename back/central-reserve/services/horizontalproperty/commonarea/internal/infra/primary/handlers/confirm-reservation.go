package handlers

import (
	"net/http"

	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// ConfirmReservation confirma una reserva aprobada (paso previo al check-in)
func (h *CommonAreaHandler) ConfirmReservation(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "ConfirmReservation")

	id, ok := parseIDParam(c, "id")
	if !ok {
		return
	}
	if _, ok := h.loadReservationInScope(c, id); !ok {
		return
	}
	reservation, err := h.useCase.ConfirmReservation(ctx, id)
	if err != nil {
		h.writeUseCaseError(c, err, "Error confirmando reserva")
		return
	}
	c.JSON(http.StatusOK, response.SuccessResponse{Success: true, Message: "Reserva confirmada", Data: mappers.ReservationToResponse(reservation)})
}
