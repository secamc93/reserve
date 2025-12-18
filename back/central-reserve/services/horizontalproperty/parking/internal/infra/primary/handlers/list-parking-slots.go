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

// ListParkingSlots lista los espacios de parqueo
func (h *ParkingHandler) ListParkingSlots(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "ListParkingSlots")

	var req request.ListParkingSlotsRequest
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

	filters := domain.ParkingSlotFiltersDTO{
		BusinessID:    businessID,
		ParkingZoneID: req.ParkingZoneID,
		ParkingTypeID: req.ParkingTypeID,
		IsActive:      req.IsActive,
		IsAvailable:   req.IsAvailable,
		Page:          req.Page,
		PageSize:      req.PageSize,
	}

	result, err := h.useCase.ListParkingSlots(ctx, filters)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error listando espacios de parqueo")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error listando espacios de parqueo",
			Error:   err.Error(),
		})
		return
	}

	slots := make([]response.ParkingSlotListResponse, len(result.ParkingSlots))
	for i, slot := range result.ParkingSlots {
		slots[i] = response.ParkingSlotListResponse{
			ID:              slot.ID,
			ParkingZoneID:   slot.ParkingZoneID,
			ParkingZoneName: slot.ParkingZoneName,
			ParkingTypeID:   slot.ParkingTypeID,
			ParkingTypeName: slot.ParkingTypeName,
			SlotNumber:      slot.SlotNumber,
			IsCovered:       slot.IsCovered,
			HasCharger:      slot.HasCharger,
			IsActive:        slot.IsActive,
			IsAvailable:     slot.IsAvailable,
			IsAssigned:      slot.IsAssigned,
			IsOccupied:      slot.IsOccupied,
		}
	}

	c.JSON(http.StatusOK, response.PaginatedParkingSlotsResponse{
		Success:    true,
		Data:       slots,
		Total:      result.Total,
		Page:       result.Page,
		PageSize:   result.PageSize,
		TotalPages: result.TotalPages,
	})
}
