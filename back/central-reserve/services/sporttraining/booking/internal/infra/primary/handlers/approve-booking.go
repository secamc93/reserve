package handlers

import (
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/sporttraining/booking/internal/domain"
	"central_reserve/services/sporttraining/booking/internal/infra/primary/handlers/mappers"
	"central_reserve/services/sporttraining/booking/internal/infra/primary/handlers/request"
	"central_reserve/services/sporttraining/booking/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func (h *BookingHandler) ApproveBooking(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "ApproveBooking")

	businessID, exists := middleware.GetBusinessID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "business_id no disponible",
		})
		return
	}

	userID, _ := middleware.GetUserID(c)

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID inválido",
		})
		return
	}

	var req request.ApproveBookingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	dto := domain.ApproveBookingDTO{
		ID:         uint(id),
		BusinessID: businessID,
		CoachID:    userID,
		Notes:      req.Notes,
	}

	booking, err := h.useCase.ApproveBooking(ctx, dto)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error aprobando reserva")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error aprobando reserva",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.BookingResponse{
		Success: true,
		Data:    mappers.BookingToResponse(booking),
	})
}
