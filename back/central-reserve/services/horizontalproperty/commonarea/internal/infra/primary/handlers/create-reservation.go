package handlers

import (
	"net/http"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// CreateReservation crea una nueva reserva
func (h *CommonAreaHandler) CreateReservation(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "CreateReservation")

	var req request.CreateReservationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	businessID, exists := middleware.GetBusinessID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "business_id no disponible",
		})
		return
	}

	dto := domain.CreateReservationDTO{
		BusinessID:      businessID,
		CommonAreaID:    req.CommonAreaID,
		PropertyUnitID:  req.PropertyUnitID,
		ResidentID:      req.ResidentID,
		ReservationDate: req.ReservationDate,
		StartTime:       req.StartTime,
		EndTime:         req.EndTime,
		NumberOfGuests:  req.NumberOfGuests,
		Purpose:         req.Purpose,
		SpecialRequests: req.SpecialRequests,
		IsRecurring:     req.IsRecurring,
	}

	reservation, err := h.useCase.CreateReservation(ctx, dto)
	if err != nil {
		if err == domain.ErrReservationNotAvailable || err == domain.ErrExceedsCapacity || err == domain.ErrScheduleNotConfigured || err == domain.ErrRestrictionActive {
			c.JSON(http.StatusBadRequest, response.ErrorResponse{
				Success: false,
				Message: err.Error(),
			})
			return
		}
		h.logger.Error(ctx).Err(err).Msg("Error creando reserva")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error creando reserva",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, response.SuccessResponse{
		Success: true,
		Message: "Reserva creada exitosamente",
		Data:    mapReservationToResponse(reservation),
	})
}

// mapReservationToResponse mapea dominio a response
func mapReservationToResponse(r *domain.CommonAreaReservation) response.ReservationResponse {
	return response.ReservationResponse{
		ID:                  r.ID,
		BusinessID:          r.BusinessID,
		CommonAreaID:        r.CommonAreaID,
		PropertyUnitID:      r.PropertyUnitID,
		ResidentID:          r.ResidentID,
		ReservationStatusID: r.ReservationStatusID,
		ReservationDate:     r.ReservationDate,
		StartTime:           r.StartTime,
		EndTime:             r.EndTime,
		DurationHours:       r.DurationHours,
		NumberOfGuests:      r.NumberOfGuests,
		Purpose:             r.Purpose,
		QRCode:              r.QRCode,
		AccessCode:          r.AccessCode,
		CreatedAt:           r.CreatedAt,
	}
}
