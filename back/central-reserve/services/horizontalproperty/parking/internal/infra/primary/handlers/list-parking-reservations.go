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

// ListParkingReservations lista las reservas de parqueaderos
func (h *ParkingHandler) ListParkingReservations(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "ListParkingReservations")

	var req request.ListParkingReservationsRequest
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

	filters := domain.ParkingReservationFiltersDTO{
		BusinessID:          businessID,
		ParkingSlotID:       req.ParkingSlotID,
		PropertyUnitID:      req.PropertyUnitID,
		ResidentID:          req.ResidentID,
		VisitorID:           req.VisitorID,
		ReservationStatusID: req.ReservationStatusID,
		StartDate:           req.StartDate,
		EndDate:             req.EndDate,
		Page:                req.Page,
		PageSize:            req.PageSize,
	}

	result, err := h.useCase.ListParkingReservations(ctx, filters)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error listando reservas")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error listando reservas",
			Error:   err.Error(),
		})
		return
	}

	reservations := make([]response.ParkingReservationListResponse, len(result.ParkingReservations))
	for i, res := range result.ParkingReservations {
		reservations[i] = response.ParkingReservationListResponse{
			ID:                 res.ID,
			ParkingSlotID:      res.ParkingSlotID,
			ParkingSlotNumber:  res.ParkingSlotNumber,
			PropertyUnitID:     res.PropertyUnitID,
			PropertyUnitNumber: res.PropertyUnitNumber,
			ResidentID:         res.ResidentID,
			ResidentName:       res.ResidentName,
			VisitorID:          res.VisitorID,
			VisitorName:        res.VisitorName,
			StatusName:         res.StatusName,
			ReservationDate:    res.ReservationDate,
			StartTime:          res.StartTime,
			EndTime:            res.EndTime,
			VehiclePlate:       res.VehiclePlate,
			CheckedInAt:        res.CheckedInAt,
			CheckedOutAt:       res.CheckedOutAt,
			CreatedAt:          res.CreatedAt,
		}
	}

	c.JSON(http.StatusOK, response.PaginatedParkingReservationsResponse{
		Success:    true,
		Data:       reservations,
		Total:      result.Total,
		Page:       result.Page,
		PageSize:   result.PageSize,
		TotalPages: result.TotalPages,
	})
}
