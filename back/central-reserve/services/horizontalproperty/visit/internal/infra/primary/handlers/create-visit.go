package handlers

import (
	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/services/horizontalproperty/visit/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/visit/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// CreateVisit crea una nueva visita
// @Summary Crear visita
// @Description Crea una nueva visita para un visitante
// @Tags Visits
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body request.CreateVisitRequest true "Datos de la visita"
// @Success 201 {object} response.VisitResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /horizontal-properties/visits [post]
func (h *VisitHandler) CreateVisit(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "CreateVisit")

	var req request.CreateVisitRequest
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

	dto := domain.CreateVisitDTO{
		BusinessID:         businessID,
		VisitorID:          req.VisitorID,
		PropertyUnitID:     req.PropertyUnitID,
		ResidentID:         req.ResidentID,
		VisitTypeID:        req.VisitTypeID,
		VisitorVehicleID:   req.VisitorVehicleID,
		ScheduledDate:      req.ScheduledDate,
		ScheduledStartTime: req.ScheduledStartTime,
		ScheduledEndTime:   req.ScheduledEndTime,
		Purpose:            req.Purpose,
		NumberOfVisitors:   req.NumberOfVisitors,
		HasCompanions:      req.HasCompanions,
		HasAssets:          req.HasAssets,
		Notes:              req.Notes,
		NotifyResident:     req.NotifyResident,
		NotifySecurity:     req.NotifySecurity,
	}

	visit, err := h.useCase.CreateVisit(ctx, dto)
	if err != nil {
		if err == domain.ErrVisitorBlacklisted {
			c.JSON(http.StatusForbidden, response.ErrorResponse{
				Success: false,
				Message: "El visitante está en lista negra",
			})
			return
		}
		h.logger.Error(ctx).Err(err).Msg("Error creando visita")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error creando visita",
		})
		return
	}

	c.JSON(http.StatusCreated, response.VisitResponse{
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
