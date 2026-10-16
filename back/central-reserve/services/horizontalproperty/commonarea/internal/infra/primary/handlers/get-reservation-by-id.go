package handlers

import (
	"net/http"

	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// GetReservationByID obtiene una reserva por ID (solo de la propiedad del usuario)
func (h *CommonAreaHandler) GetReservationByID(c *gin.Context) {
	id, ok := parseIDParam(c, "id")
	if !ok {
		return
	}
	reservation, ok := h.loadReservationInScope(c, id)
	if !ok {
		return
	}
	c.JSON(http.StatusOK, response.SuccessResponse{
		Success: true,
		Data:    mappers.ReservationToResponse(reservation),
	})
}
