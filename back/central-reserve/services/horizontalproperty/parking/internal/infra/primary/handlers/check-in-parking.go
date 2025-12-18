package handlers

import (
	"fmt"
	"net/http"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/parking/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// CheckInParking registra la entrada de un vehículo al parqueadero
func (h *ParkingHandler) CheckInParking(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "CheckInParking")

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

	userID, _ := middleware.GetUserID(c)

	reservation, err := h.useCase.CheckInParking(ctx, id, userID)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error registrando check-in")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error registrando check-in",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.SuccessResponse{
		Success: true,
		Message: "Check-in registrado exitosamente",
		Data: response.ParkingReservationResponse{
			ID:                  reservation.ID,
			BusinessID:          reservation.BusinessID,
			ParkingSlotID:       reservation.ParkingSlotID,
			ReservationStatusID: reservation.ReservationStatusID,
			ReservationDate:     reservation.ReservationDate,
			StartTime:           reservation.StartTime,
			EndTime:             reservation.EndTime,
			VehiclePlate:        reservation.VehiclePlate,
			CheckedInAt:         reservation.CheckedInAt,
			CheckedOutAt:        reservation.CheckedOutAt,
			CreatedAt:           reservation.CreatedAt,
		},
	})
}
