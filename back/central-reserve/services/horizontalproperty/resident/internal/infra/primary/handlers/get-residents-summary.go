package handlers

import (
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/resident/internal/domain"
	"central_reserve/services/horizontalproperty/resident/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/resident/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// GetResidentsSummary godoc
//
//	@Summary		Resumen de residentes
//	@Description	Totales de residentes de una propiedad (activos, principales) y conteo por tipo
//	@Tags			Residents
//	@Produce		json
//	@Security		BearerAuth
//	@Param			business_id	query	int	false	"ID del business (obligatorio para super admin)"
//	@Success		200			{object}	response.ResidentsSummarySuccess
//	@Failure		400			{object}	response.ErrorResponse
//	@Failure		403			{object}	response.ErrorResponse
//	@Failure		500			{object}	response.ErrorResponse
//	@Router			/horizontal-properties/residents/summary [get]
func (h *ResidentHandler) GetResidentsSummary(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "GetResidentsSummary")

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
			c.JSON(http.StatusUnauthorized, response.ErrorResponse{Success: false, Message: "Token inválido", Error: "business_id no disponible en el token"})
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

	summary, err := h.useCase.GetResidentsSummary(ctx, businessID)
	if err != nil {
		if err == domain.ErrBusinessIDRequired {
			c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "business_id es requerido", Error: err.Error()})
			return
		}
		h.logger.Error(ctx).Err(err).Msg("Error obteniendo resumen de residentes")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error obteniendo el resumen de residentes", Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, response.ResidentsSummarySuccess{
		Success: true,
		Message: "Resumen de residentes obtenido exitosamente",
		Data:    mappers.MapSummaryDTOToResponse(summary),
	})
}
