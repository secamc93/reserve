package handlers

import (
	"net/http"
	"strconv"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/services/horizontalproperty/visit/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/visit/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// UpdateVisit actualiza una visita
// @Summary Actualizar visita
// @Description Actualiza los datos de una visita existente
// @Tags Visits
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param visit_id path int true "ID de la visita"
// @Param body body request.UpdateVisitRequest true "Datos a actualizar"
// @Success 200 {object} response.VisitResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /horizontal-properties/visits/{visit_id} [put]
func (h *VisitHandler) UpdateVisit(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "UpdateVisit")

	visitIDParam := c.Param("visit_id")
	visitID, err := strconv.ParseUint(visitIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de visita inválido",
		})
		return
	}

	var req request.UpdateVisitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos de actualización inválidos",
			Error:   err.Error(),
		})
		return
	}

	dto := domain.UpdateVisitDTO{
		PropertyUnitID:     req.PropertyUnitID,
		ResidentID:         req.ResidentID,
		VisitTypeID:        req.VisitTypeID,
		ScheduledDate:      req.ScheduledDate,
		ScheduledStartTime: req.ScheduledStartTime,
		ScheduledEndTime:   req.ScheduledEndTime,
		Purpose:            req.Purpose,
		NumberOfVisitors:   req.NumberOfVisitors,
		Notes:              req.Notes,
		NotifyResident:     req.NotifyResident,
		NotifySecurity:     req.NotifySecurity,
	}

	visit, err := h.useCase.UpdateVisit(ctx, uint(visitID), dto)
	if err != nil {
		if err == domain.ErrVisitNotFound {
			c.JSON(http.StatusNotFound, response.ErrorResponse{
				Success: false,
				Message: "Visita no encontrada",
			})
			return
		}
		if err == domain.ErrVisitAlreadyCompleted {
			c.JSON(http.StatusBadRequest, response.ErrorResponse{
				Success: false,
				Message: "No se puede editar una visita completada",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error actualizando visita",
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
