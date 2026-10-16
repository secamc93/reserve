package handlers

import (
	"errors"
	"net/http"

	"central_reserve/services/horizontalproperty/parking/internal/domain"
	"central_reserve/services/horizontalproperty/parking/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/parking/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// CreateParkingSlotsBulk godoc
//
//	@Summary		Crear varios cupos
//	@Description	Crea cupos con numeración consecutiva en una zona de la propiedad: prefijo + número desde..hasta, rellenado con ceros hasta `pad` dígitos (máximo 200). Si algún número ya existe no crea ninguno (409).
//	@Tags			Parqueaderos
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			request	body		request.CreateParkingSlotsBulkRequest	true	"Cupos"
//	@Success		201		{object}	response.BulkParkingSlotsResponse
//	@Failure		400		{object}	response.ErrorResponse
//	@Failure		404		{object}	response.ErrorResponse
//	@Failure		409		{object}	response.ErrorResponse
//	@Router			/horizontal-properties/parking/slots/bulk [post]
func (h *ParkingHandler) CreateParkingSlotsBulk(c *gin.Context) {
	var req request.CreateParkingSlotsBulkRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Datos inválidos", Error: err.Error()})
		return
	}
	businessID, ok := businessScope(c)
	if !ok {
		return
	}
	slots, err := h.useCase.CreateParkingSlotsBulk(c.Request.Context(), domain.CreateParkingSlotsBulkDTO{
		BusinessID:    businessID,
		ParkingZoneID: req.ParkingZoneID,
		ParkingTypeID: req.ParkingTypeID,
		Prefix:        req.Prefix,
		From:          req.From,
		To:            req.To,
		Pad:           req.Pad,
		IsCovered:     req.IsCovered,
		HasCharger:    req.HasCharger,
		Width:         req.Width,
		Length:        req.Length,
		Height:        req.Height,
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrParkingZoneNotFound):
			c.JSON(http.StatusNotFound, response.ErrorResponse{Success: false, Message: "Zona no encontrada", Error: err.Error()})
		case errors.Is(err, domain.ErrSlotNumberExists):
			c.JSON(http.StatusConflict, response.ErrorResponse{Success: false, Message: "Ya existen cupos con esos números", Error: err.Error()})
		case errors.Is(err, domain.ErrInvalidSlotRange), errors.Is(err, domain.ErrTooManySlots):
			c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: err.Error(), Error: err.Error()})
		default:
			h.logger.Error(c.Request.Context()).Err(err).Msg("Error creando cupos en lote")
			c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error creando cupos", Error: err.Error()})
		}
		return
	}
	out := make([]response.ParkingSlotResponse, len(slots))
	for i, s := range slots {
		out[i] = response.ParkingSlotResponse{
			ID: s.ID, ParkingZoneID: s.ParkingZoneID, ParkingTypeID: s.ParkingTypeID, SlotNumber: s.SlotNumber,
			IsCovered: s.IsCovered, Width: s.Width, Length: s.Length, Height: s.Height, HasCharger: s.HasCharger, IsActive: s.IsActive,
		}
	}
	c.JSON(http.StatusCreated, gin.H{"success": true, "message": "Cupos creados", "data": response.BulkParkingSlotsResponse{Created: len(out), Slots: out}})
}
