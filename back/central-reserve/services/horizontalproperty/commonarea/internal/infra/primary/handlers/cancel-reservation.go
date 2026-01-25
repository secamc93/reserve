package handlers

import (
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/mappers"
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// CancelReservation cancela una reserva
func (h *CommonAreaHandler) CancelReservation(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "CancelReservation")

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID inválido",
		})
		return
	}

	var req request.CancelReservationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "user_id no disponible",
		})
		return
	}

	reservation, err := h.useCase.CancelReservation(ctx, uint(id), userID, req.Reason)
	if err != nil {
		if err == domain.ErrReservationNotFound {
			c.JSON(http.StatusNotFound, response.ErrorResponse{
				Success: false,
				Message: "Reserva no encontrada",
			})
			return
		}
		h.logger.Error(ctx).Err(err).Msg("Error cancelando reserva")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error cancelando reserva",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.SuccessResponse{
		Success: true,
		Message: "Reserva cancelada exitosamente",
		Data:    mappers.ReservationToResponse(reservation),
	})
}
