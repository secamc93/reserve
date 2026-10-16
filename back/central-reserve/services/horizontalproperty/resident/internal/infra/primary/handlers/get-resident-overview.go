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

// GetResidentOverview godoc
//
//	@Summary		Resumen del residente
//	@Description	Cifras (visitas 30 días, paquetes pendientes, reservas, votos), otros residentes de la unidad y actividad reciente
//	@Tags			Residents
//	@Produce		json
//	@Security		BearerAuth
//	@Param			resident_id	path	int	true	"ID del residente"
//	@Param			business_id	query	int	false	"ID del business (obligatorio para super admin)"
//	@Success		200			{object}	response.ResidentOverviewSuccess
//	@Failure		400			{object}	response.ErrorResponse
//	@Failure		403			{object}	response.ErrorResponse
//	@Failure		404			{object}	response.ErrorResponse
//	@Router			/horizontal-properties/residents/{resident_id}/overview [get]
func (h *ResidentHandler) GetResidentOverview(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "GetResidentOverview")

	residentID, err := strconv.ParseUint(c.Param("resident_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "ID de residente inválido", Error: "Debe ser numérico"})
		return
	}

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

	overview, err := h.useCase.GetResidentOverview(ctx, businessID, uint(residentID))
	if err != nil {
		switch err {
		case domain.ErrBusinessIDRequired:
			c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "business_id es requerido", Error: err.Error()})
		case domain.ErrResidentNotFound:
			c.JSON(http.StatusNotFound, response.ErrorResponse{Success: false, Message: "Residente no encontrado", Error: err.Error()})
		default:
			h.logger.Error(ctx).Err(err).Msg("Error obteniendo resumen del residente")
			c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error obteniendo el resumen del residente", Error: err.Error()})
		}
		return
	}
	c.JSON(http.StatusOK, response.ResidentOverviewSuccess{
		Success: true,
		Message: "Resumen del residente obtenido exitosamente",
		Data:    mappers.MapOverviewDTOToResponse(overview),
	})
}
