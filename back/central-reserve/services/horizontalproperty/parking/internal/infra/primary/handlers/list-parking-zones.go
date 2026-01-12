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

// ListParkingZones lista las zonas de parqueo
func (h *ParkingHandler) ListParkingZones(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "ListParkingZones")

	var req request.ListParkingZonesRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Parámetros inválidos",
			Error:   err.Error(),
		})
		return
	}

	// Verificar si es super admin y decidir businessID
	isSuperAdmin := middleware.IsSuperAdmin(c)
	var businessID uint

	if isSuperAdmin {
		// Super admin: puede usar business_id del query param o ver todo (0)
		businessIDParam := c.Query("business_id")
		if businessIDParam != "" {
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
			// Si no envía business_id, ver todo (business_id = 0)
			businessID = 0
		}
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

	filters := domain.ParkingZoneFiltersDTO{
		BusinessID: businessID,
		IsActive:   req.IsActive,
		Page:       req.Page,
		PageSize:   req.PageSize,
	}

	result, err := h.useCase.ListParkingZones(ctx, filters)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error listando zonas de parqueo")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error listando zonas de parqueo",
			Error:   err.Error(),
		})
		return
	}

	zones := make([]response.ParkingZoneListResponse, len(result.ParkingZones))
	for i, zone := range result.ParkingZones {
		zones[i] = response.ParkingZoneListResponse{
			ID:         zone.ID,
			Name:       zone.Name,
			Code:       zone.Code,
			Location:   zone.Location,
			TotalSlots: zone.TotalSlots,
			IsActive:   zone.IsActive,
		}
	}

	c.JSON(http.StatusOK, response.PaginatedParkingZonesResponse{
		Success:    true,
		Data:       zones,
		Total:      result.Total,
		Page:       result.Page,
		PageSize:   result.PageSize,
		TotalPages: result.TotalPages,
	})
}
