package handlers

import (
	"net/http"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/parking/internal/domain"
	"central_reserve/services/horizontalproperty/parking/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/parking/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// CreateParkingReservation crea una reserva temporal de parqueadero
func (h *ParkingHandler) CreateParkingReservation(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "CreateParkingReservation")

	var req request.CreateParkingReservationRequest
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

	dto := domain.CreateParkingReservationDTO{
		BusinessID:       businessID,
		ParkingSlotID:    req.ParkingSlotID,
		PropertyUnitID:   req.PropertyUnitID,
		ResidentID:       req.ResidentID,
		VisitorID:        req.VisitorID,
		VisitorVehicleID: req.VisitorVehicleID,
		ReservationDate:  req.ReservationDate,
		StartTime:        req.StartTime,
		EndTime:          req.EndTime,
		VehiclePlate:     req.VehiclePlate,
		VehicleBrand:     req.VehicleBrand,
		VehicleModel:     req.VehicleModel,
		VehicleColor:     req.VehicleColor,
		RequiresApproval: req.RequiresApproval,
		Notes:            req.Notes,
		ResidentNotes:    req.ResidentNotes,
	}

	reservation, err := h.useCase.CreateParkingReservation(ctx, dto)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error creando reserva de parqueadero")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error creando reserva de parqueadero",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, response.SuccessResponse{
		Success: true,
		Message: "Reserva de parqueadero creada exitosamente",
		Data: response.ParkingReservationResponse{
			ID:                  reservation.ID,
			BusinessID:          reservation.BusinessID,
			ParkingSlotID:       reservation.ParkingSlotID,
			PropertyUnitID:      reservation.PropertyUnitID,
			ResidentID:          reservation.ResidentID,
			VisitorID:           reservation.VisitorID,
			ReservationStatusID: reservation.ReservationStatusID,
			ReservationDate:     reservation.ReservationDate,
			StartTime:           reservation.StartTime,
			EndTime:             reservation.EndTime,
			DurationHours:       reservation.DurationHours,
			VehiclePlate:        reservation.VehiclePlate,
			QRCode:              reservation.QRCode,
			AccessCode:          reservation.AccessCode,
			CheckedInAt:         reservation.CheckedInAt,
			CheckedOutAt:        reservation.CheckedOutAt,
			CreatedAt:           reservation.CreatedAt,
		},
	})
}
