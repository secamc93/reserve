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

// AssignParking asigna un parqueadero permanente
func (h *ParkingHandler) AssignParking(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "AssignParking")

	var req request.AssignParkingRequest
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

	userID, _ := middleware.GetUserID(c)

	dto := domain.AssignParkingDTO{
		BusinessID:       businessID,
		ParkingSlotID:    req.ParkingSlotID,
		PropertyUnitID:   req.PropertyUnitID,
		ResidentID:       req.ResidentID,
		VehiclePlate:     req.VehiclePlate,
		VehicleBrand:     req.VehicleBrand,
		VehicleModel:     req.VehicleModel,
		VehicleColor:     req.VehicleColor,
		StartDate:        req.StartDate,
		EndDate:          req.EndDate,
		Notes:            req.Notes,
		AssignedByUserID: userID,
	}

	assignment, err := h.useCase.AssignParking(ctx, dto)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error asignando parqueadero")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error asignando parqueadero",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, response.SuccessResponse{
		Success: true,
		Message: "Parqueadero asignado exitosamente",
		Data: response.ParkingAssignmentResponse{
			ID:             assignment.ID,
			BusinessID:     assignment.BusinessID,
			ParkingSlotID:  assignment.ParkingSlotID,
			PropertyUnitID: assignment.PropertyUnitID,
			ResidentID:     assignment.ResidentID,
			VehiclePlate:   assignment.VehiclePlate,
			VehicleBrand:   assignment.VehicleBrand,
			VehicleModel:   assignment.VehicleModel,
			VehicleColor:   assignment.VehicleColor,
			StartDate:      assignment.StartDate,
			EndDate:        assignment.EndDate,
			IsActive:       assignment.IsActive,
			Notes:          assignment.Notes,
			CreatedAt:      assignment.CreatedAt,
			UpdatedAt:      assignment.UpdatedAt,
		},
	})
}
