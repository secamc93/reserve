package handlers

import (
	"net/http"

	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// CheckAvailability verifica la disponibilidad de una zona común
func (h *CommonAreaHandler) CheckAvailability(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "CheckAvailability")

	var req request.CheckAvailabilityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	dto := domain.CheckAvailabilityDTO{
		CommonAreaID:    req.CommonAreaID,
		ReservationDate: req.ReservationDate,
		StartTime:       req.StartTime,
		EndTime:         req.EndTime,
	}

	available, err := h.useCase.CheckAvailability(ctx, dto)
	if err != nil {
		if err == domain.ErrScheduleNotConfigured || err == domain.ErrRestrictionActive {
			c.JSON(http.StatusOK, response.CheckAvailabilityResponse{
				Success:   true,
				Available: false,
				Message:   err.Error(),
			})
			return
		}
		h.logger.Error(ctx).Err(err).Msg("Error verificando disponibilidad")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error verificando disponibilidad",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.CheckAvailabilityResponse{
		Success:   true,
		Available: available,
	})
}
