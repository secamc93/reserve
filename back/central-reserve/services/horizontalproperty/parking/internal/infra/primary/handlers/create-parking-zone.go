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

// CreateParkingZone crea una nueva zona de parqueo
func (h *ParkingHandler) CreateParkingZone(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "CreateParkingZone")

	var req request.CreateParkingZoneRequest
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

	dto := domain.CreateParkingZoneDTO{
		BusinessID:  businessID,
		Name:        req.Name,
		Code:        req.Code,
		Description: req.Description,
		Location:    req.Location,
	}

	zone, err := h.useCase.CreateParkingZone(ctx, dto)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error creando zona de parqueo")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error creando zona de parqueo",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, response.SuccessResponse{
		Success: true,
		Message: "Zona de parqueo creada exitosamente",
		Data: response.ParkingZoneResponse{
			ID:          zone.ID,
			BusinessID:  zone.BusinessID,
			Name:        zone.Name,
			Code:        zone.Code,
			Description: zone.Description,
			Location:    zone.Location,
			TotalSlots:  zone.TotalSlots,
			IsActive:    zone.IsActive,
			CreatedAt:   zone.CreatedAt,
			UpdatedAt:   zone.UpdatedAt,
		},
	})
}
