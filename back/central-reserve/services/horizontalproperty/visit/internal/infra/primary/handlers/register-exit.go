package handlers

import (
	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/visit/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/visit/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// RegisterExit registra la salida de una visita
// @Summary Registrar salida de visita
// @Description Registra la salida de un visitante
// @Tags Visits
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param visit_id path int true "ID de la visita"
// @Param request body request.RegisterExitRequest true "Datos de salida"
// @Success 200 {object} response.VisitResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /horizontal-properties/visits/{visit_id}/register-exit [post]
func (h *VisitHandler) RegisterExit(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "RegisterExit")

	visitIDParam := c.Param("visit_id")
	visitID, err := strconv.ParseUint(visitIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de visita inválido",
		})
		return
	}

	var req request.RegisterExitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "user_id no disponible",
		})
		return
	}

	visit, err := h.useCase.RegisterExit(ctx, uint(visitID), userID, req.Gate)
	if err != nil {
		if err.Error() == "hay activos pendientes de verificación de salida" {
			c.JSON(http.StatusBadRequest, response.ErrorResponse{
				Success: false,
				Message: "No se puede registrar salida: hay activos pendientes de verificación",
			})
			return
		}
		h.logger.Error(ctx).Err(err).Uint("visit_id", uint(visitID)).Msg("Error registrando salida")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error registrando salida",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.VisitResponse{
		Success: true,
		Data: response.VisitData{
			ID:              visit.ID,
			BusinessID:      visit.BusinessID,
			VisitorID:       visit.VisitorID,
			PropertyUnitID:  visit.PropertyUnitID,
			VisitStatusID:   visit.VisitStatusID,
			ActualEntryTime: visit.ActualEntryTime,
			ActualExitTime:  visit.ActualExitTime,
		},
	})
}
