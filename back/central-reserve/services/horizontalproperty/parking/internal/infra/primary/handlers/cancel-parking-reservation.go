package handlers

import (
	"fmt"
	"net/http"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/parking/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/parking/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// CancelParkingReservation cancela una reserva de parqueadero
func (h *ParkingHandler) CancelParkingReservation(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "CancelParkingReservation")

	reservationID := c.Param("id")
	if reservationID == "" {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de reserva requerido",
		})
		return
	}

	var id uint
	if _, err := fmt.Sscanf(reservationID, "%d", &id); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de reserva inválido",
		})
		return
	}

	var req request.CancelParkingReservationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	userID, _ := middleware.GetUserID(c)

	reservation, err := h.useCase.CancelParkingReservation(ctx, id, userID, req.Reason)
	if err != nil {
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
		Data: response.ParkingReservationResponse{
			ID:                  reservation.ID,
			BusinessID:          reservation.BusinessID,
			ParkingSlotID:       reservation.ParkingSlotID,
			ReservationStatusID: reservation.ReservationStatusID,
			ReservationDate:     reservation.ReservationDate,
			StartTime:           reservation.StartTime,
			EndTime:             reservation.EndTime,
			VehiclePlate:        reservation.VehiclePlate,
			CreatedAt:           reservation.CreatedAt,
		},
	})
}
