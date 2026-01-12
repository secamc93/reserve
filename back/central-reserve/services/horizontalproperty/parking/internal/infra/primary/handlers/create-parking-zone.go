package handlers

import (
	"net/http"
	"strconv"

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

	// Verificar si es super admin y decidir businessID
	isSuperAdmin := middleware.IsSuperAdmin(c)
	var businessID uint

	if isSuperAdmin {
		// Super admin: debe recibir business_id del query param
		businessIDParam := c.Query("business_id")
		if businessIDParam == "" {
			h.logger.Error(ctx).Msg("Super admin debe enviar business_id en query param")
			c.JSON(http.StatusBadRequest, response.ErrorResponse{
				Success: false,
				Message: "business_id requerido",
				Error:   "Los super administradores deben enviar business_id en el query param",
			})
			return
		}
		businessIDFromQuery, err := strconv.ParseUint(businessIDParam, 10, 32)
		if err != nil {
			h.logger.Error(ctx).Err(err).Str("business_id", businessIDParam).Msg("Error parseando business_id del query")
			c.JSON(http.StatusBadRequest, response.ErrorResponse{
				Success: false,
				Message: "business_id inválido",
				Error:   "Debe ser numérico",
			})
			return
		}
		businessID = uint(businessIDFromQuery)
	} else {
		// Usuario normal: usar business_id del token
		tokenBusinessID, exists := middleware.GetBusinessID(c)
		if !exists {
			h.logger.Error(ctx).Msg("business_id no disponible en el token")
			c.JSON(http.StatusUnauthorized, response.ErrorResponse{
				Success: false,
				Message: "Token inválido",
				Error:   "business_id no disponible en el token",
			})
			return
		}
		businessID = tokenBusinessID
	}

	// Agregar business_id al contexto para logging
	ctx = log.WithBusinessIDCtx(ctx, businessID)

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
