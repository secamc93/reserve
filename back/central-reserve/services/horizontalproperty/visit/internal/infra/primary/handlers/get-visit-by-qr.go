package handlers

import (
	"central_reserve/services/horizontalproperty/visit/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetVisitByQRCode obtiene una visita por código QR
// @Summary Obtener visita por QR
// @Description Obtiene los detalles de una visita usando su código QR
// @Tags Visits
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param qr_code path string true "Código QR de la visita"
// @Success 200 {object} response.VisitResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /horizontal-properties/visits/qr/{qr_code} [get]
func (h *VisitHandler) GetVisitByQRCode(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "GetVisitByQRCode")

	qrCode := c.Param("qr_code")
	if qrCode == "" {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Código QR es requerido",
		})
		return
	}

	visit, err := h.useCase.GetVisitByQRCode(ctx, qrCode)
	if err != nil {
		h.logger.Error(ctx).Err(err).Str("qr_code", qrCode).Msg("Error obteniendo visita por QR")
		c.JSON(http.StatusNotFound, response.ErrorResponse{
			Success: false,
			Message: "Visita no encontrada",
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
			ActualEntryTime:    visit.ActualEntryTime,
			ActualExitTime:     visit.ActualExitTime,
			AuthorizationCode:  visit.AuthorizationCode,
			QRCode:             visit.QRCode,
			Purpose:            visit.Purpose,
			Notes:              visit.Notes,
		},
	})
}
