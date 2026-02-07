package handlers

import (
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/sporttraining/booking/internal/infra/primary/handlers/mappers"
	"central_reserve/services/sporttraining/booking/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func (h *BookingHandler) GetBookingByID(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "GetBookingByID")

	businessID, exists := middleware.GetBusinessID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "business_id no disponible",
		})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID inválido",
		})
		return
	}

	booking, err := h.useCase.GetBookingByID(ctx, uint(id), businessID)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msgf("Error obteniendo reserva %d", id)
		c.JSON(http.StatusNotFound, response.ErrorResponse{
			Success: false,
			Message: "Reserva no encontrada",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.BookingResponse{
		Success: true,
		Data:    mappers.BookingToResponse(booking),
	})
}
