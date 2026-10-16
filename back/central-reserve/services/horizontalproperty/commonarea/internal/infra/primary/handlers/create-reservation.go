package handlers

import (
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/mappers"
	"net/http"

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

	businessID, ok := h.resolveBusinessID(c)
	if !ok {
		return
	}

	if area, ok := h.loadAreaInScope(c, req.CommonAreaID); !ok {
		return
	} else if area.BusinessID != businessID {
		c.JSON(http.StatusNotFound, response.ErrorResponse{Success: false, Message: "Zona común no encontrada"})
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
		h.writeUseCaseError(c, err, "Error creando reserva")
		return
	}

	c.JSON(http.StatusCreated, response.SuccessResponse{
		Success: true,
		Message: "Reserva creada exitosamente",
		Data:    mappers.ReservationToResponse(reservation),
	})
}
