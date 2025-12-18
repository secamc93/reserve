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

// ListParkingAssignments lista las asignaciones de parqueaderos
func (h *ParkingHandler) ListParkingAssignments(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "ListParkingAssignments")

	var req request.ListParkingAssignmentsRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Parámetros inválidos",
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

	filters := domain.ParkingAssignmentFiltersDTO{
		BusinessID:     businessID,
		ParkingSlotID:  req.ParkingSlotID,
		PropertyUnitID: req.PropertyUnitID,
		ResidentID:     req.ResidentID,
		IsActive:       req.IsActive,
		Page:           req.Page,
		PageSize:       req.PageSize,
	}

	result, err := h.useCase.ListParkingAssignments(ctx, filters)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error listando asignaciones")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error listando asignaciones",
			Error:   err.Error(),
		})
		return
	}

	assignments := make([]response.ParkingAssignmentListResponse, len(result.ParkingAssignments))
	for i, assignment := range result.ParkingAssignments {
		assignments[i] = response.ParkingAssignmentListResponse{
			ID:                 assignment.ID,
			ParkingSlotID:      assignment.ParkingSlotID,
			ParkingSlotNumber:  assignment.ParkingSlotNumber,
			PropertyUnitID:     assignment.PropertyUnitID,
			PropertyUnitNumber: assignment.PropertyUnitNumber,
			ResidentID:         assignment.ResidentID,
			ResidentName:       assignment.ResidentName,
			VehiclePlate:       assignment.VehiclePlate,
			VehicleBrand:       assignment.VehicleBrand,
			VehicleModel:       assignment.VehicleModel,
			StartDate:          assignment.StartDate,
			EndDate:            assignment.EndDate,
			IsActive:           assignment.IsActive,
		}
	}

	c.JSON(http.StatusOK, response.PaginatedParkingAssignmentsResponse{
		Success:    true,
		Data:       assignments,
		Total:      result.Total,
		Page:       result.Page,
		PageSize:   result.PageSize,
		TotalPages: result.TotalPages,
	})
}
