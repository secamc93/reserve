package handlers

import (
	"net/http"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/sporttraining/booking/internal/domain"
	"central_reserve/services/sporttraining/booking/internal/infra/primary/handlers/mappers"
	"central_reserve/services/sporttraining/booking/internal/infra/primary/handlers/request"
	"central_reserve/services/sporttraining/booking/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func (h *BookingHandler) CreateBooking(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "CreateBooking")

	businessID, exists := middleware.GetBusinessID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "business_id no disponible",
		})
		return
	}

	userID, _ := middleware.GetUserID(c)

	var req request.CreateBookingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	dto := domain.CreateBookingDTO{
		TrainingSessionID: req.TrainingSessionID,
		PlayerID:          req.PlayerID,
		BookedByUserID:    userID,
		BusinessID:        businessID,
		RequestNotes:      req.RequestNotes,
	}

	booking, err := h.useCase.CreateBooking(ctx, dto)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error creando reserva")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error creando reserva",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, response.BookingResponse{
		Success: true,
		Data:    mappers.BookingToResponse(booking),
	})
}
