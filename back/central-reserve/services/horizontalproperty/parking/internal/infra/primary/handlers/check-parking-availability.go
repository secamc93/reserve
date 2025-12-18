package handlers

import (
	"net/http"

	"central_reserve/services/horizontalproperty/parking/internal/domain"
	"central_reserve/services/horizontalproperty/parking/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/parking/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// CheckParkingAvailability verifica la disponibilidad de un espacio de parqueo
func (h *ParkingHandler) CheckParkingAvailability(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "CheckParkingAvailability")

	var req request.CheckParkingAvailabilityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	dto := domain.CheckParkingAvailabilityDTO{
		ParkingSlotID:        req.ParkingSlotID,
		ReservationDate:      req.ReservationDate,
		StartTime:            req.StartTime,
		EndTime:              req.EndTime,
		ExcludeReservationID: nil,
	}

	isAvailable, err := h.useCase.CheckParkingAvailability(ctx, dto)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error verificando disponibilidad")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error verificando disponibilidad",
			Error:   err.Error(),
		})
		return
	}

	message := "Espacio disponible"
	if !isAvailable {
		message = "Espacio no disponible en el horario solicitado"
	}

	c.JSON(http.StatusOK, response.CheckParkingAvailabilityResponse{
		Success:   true,
		Available: isAvailable,
		Message:   message,
	})
}
