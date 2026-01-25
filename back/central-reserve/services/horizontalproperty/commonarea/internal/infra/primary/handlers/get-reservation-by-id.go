package handlers

import (
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/mappers"
	"net/http"
	"strconv"

	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// GetReservationByID obtiene una reserva por ID
func (h *CommonAreaHandler) GetReservationByID(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "GetReservationByID")

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID inválido",
		})
		return
	}

	reservation, err := h.useCase.GetReservationByID(ctx, uint(id))
	if err != nil {
		if err == domain.ErrReservationNotFound {
			c.JSON(http.StatusNotFound, response.ErrorResponse{
				Success: false,
				Message: "Reserva no encontrada",
			})
			return
		}
		h.logger.Error(ctx).Err(err).Msg("Error obteniendo reserva")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error obteniendo reserva",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.SuccessResponse{
		Success: true,
		Data:    mappers.ReservationToResponse(reservation),
	})
}
