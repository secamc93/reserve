package handlers

import (
	"net/http"

	"central_reserve/services/horizontalproperty/parking/internal/domain"
	"central_reserve/services/horizontalproperty/parking/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/parking/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// CreateParkingSlot crea un nuevo espacio de parqueo
func (h *ParkingHandler) CreateParkingSlot(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "CreateParkingSlot")

	var req request.CreateParkingSlotRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	dto := domain.CreateParkingSlotDTO{
		ParkingZoneID: req.ParkingZoneID,
		ParkingTypeID: req.ParkingTypeID,
		SlotNumber:    req.SlotNumber,
		IsCovered:     req.IsCovered,
		Width:         req.Width,
		Length:        req.Length,
		Height:        req.Height,
		HasCharger:    req.HasCharger,
	}

	slot, err := h.useCase.CreateParkingSlot(ctx, dto)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error creando espacio de parqueo")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error creando espacio de parqueo",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, response.SuccessResponse{
		Success: true,
		Message: "Espacio de parqueo creado exitosamente",
		Data: response.ParkingSlotResponse{
			ID:            slot.ID,
			ParkingZoneID: slot.ParkingZoneID,
			ParkingTypeID: slot.ParkingTypeID,
			SlotNumber:    slot.SlotNumber,
			IsCovered:     slot.IsCovered,
			Width:         slot.Width,
			Length:        slot.Length,
			Height:        slot.Height,
			HasCharger:    slot.HasCharger,
			IsActive:      slot.IsActive,
			CreatedAt:     slot.CreatedAt,
			UpdatedAt:     slot.UpdatedAt,
		},
	})
}
