package handlers

import (
	"central_reserve/services/horizontalproperty/visit/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetVisitByID obtiene una visita por ID
// @Summary Obtener visita por ID
// @Description Obtiene los detalles de una visita específica
// @Tags Visits
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param visit_id path int true "ID de la visita"
// @Success 200 {object} response.VisitResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /horizontal-properties/visits/{visit_id} [get]
func (h *VisitHandler) GetVisitByID(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "GetVisitByID")

	visitIDParam := c.Param("visit_id")
	visitID, err := strconv.ParseUint(visitIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de visita inválido",
		})
		return
	}

	visit, err := h.useCase.GetVisitByID(ctx, uint(visitID))
	if err != nil {
		if err.Error() == "visita no encontrada" {
			c.JSON(http.StatusNotFound, response.ErrorResponse{
				Success: false,
				Message: "Visita no encontrada",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error obteniendo visita",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.VisitResponse{
		Success: true,
		Data: response.VisitData{
			ID:                 visit.ID,
			BusinessID:         visit.BusinessID,
			VisitorID:          visit.VisitorID,
			PropertyUnitID:     visit.PropertyUnitID,
			ResidentID:         visit.ResidentID,
			VisitTypeID:        visit.VisitTypeID,
			VisitStatusID:      visit.VisitStatusID,
			ScheduledDate:      visit.ScheduledDate,
			ScheduledStartTime: visit.ScheduledStartTime,
			ScheduledEndTime:   visit.ScheduledEndTime,
			ActualEntryTime:    visit.ActualEntryTime,
			ActualExitTime:     visit.ActualExitTime,
			AuthorizationCode:  visit.AuthorizationCode,
			QRCode:             visit.QRCode,
			Purpose:            visit.Purpose,
			Notes:              visit.Notes,
		},
	})
}
