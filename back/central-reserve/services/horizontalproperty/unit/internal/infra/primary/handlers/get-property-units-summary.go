package handlers

import (
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/unit/internal/domain"
	"central_reserve/services/horizontalproperty/unit/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/unit/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// GetPropertyUnitsSummary godoc
//
//	@Summary		Resumen de unidades
//	@Description	Totales de unidades, suma de coeficientes y agrupación por bloque/torre de una propiedad
//	@Tags			Property Units
//	@Produce		json
//	@Security		BearerAuth
//	@Param			business_id	query	int	false	"ID del business (obligatorio para super admin)"
//	@Success		200			{object}	response.PropertyUnitsSummarySuccess
//	@Failure		400			{object}	response.ErrorResponse
//	@Failure		403			{object}	response.ErrorResponse
//	@Failure		500			{object}	response.ErrorResponse
//	@Router			/horizontal-properties/property-units/summary [get]
func (h *PropertyUnitHandler) GetPropertyUnitsSummary(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "GetPropertyUnitsSummary")

	businessIDParam := c.Query("business_id")
	var requested uint
	if businessIDParam != "" {
		v, err := strconv.ParseUint(businessIDParam, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "business_id inválido", Error: "Debe ser numérico"})
			return
		}
		requested = uint(v)
	}

	var businessID uint
	if middleware.IsSuperAdmin(c) {
		businessID = requested
	} else {
		tokenBusinessID, exists := middleware.GetBusinessID(c)
		if !exists {
			c.JSON(http.StatusUnauthorized, response.ErrorResponse{Success: false, Message: "Token inválido", Error: "business_id no disponible"})
			return
		}
		if businessIDParam != "" && requested != tokenBusinessID {
			c.JSON(http.StatusForbidden, response.ErrorResponse{
				Success: false, Message: "No tiene acceso a este business",
				Error: "El business_id del token no coincide con el business_id solicitado",
			})
			return
		}
		businessID = tokenBusinessID
	}
	ctx = log.WithBusinessIDCtx(ctx, businessID)

	summary, err := h.useCase.GetPropertyUnitsSummary(ctx, businessID)
	if err != nil {
		if err == domain.ErrBusinessIDRequired {
			c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "business_id es requerido", Error: err.Error()})
			return
		}
		h.logger.Error(ctx).Err(err).Msg("Error obteniendo resumen de unidades")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error obteniendo el resumen de unidades", Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, response.PropertyUnitsSummarySuccess{
		Success: true,
		Message: "Resumen de unidades obtenido exitosamente",
		Data:    mappers.MapSummaryDTOToResponse(summary),
	})
}
