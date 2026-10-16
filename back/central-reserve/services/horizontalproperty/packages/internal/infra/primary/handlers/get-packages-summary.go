package handlers

import (
	"net/http"
	"time"

	"central_reserve/services/horizontalproperty/packages/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// GetPackagesSummary cuenta los paquetes por grupo
// @Summary Resumen de paquetes
// @Description Conteos para la portería: por entregar (y atrasados, más de 3 días), entregados hoy, entregados y devueltos
// @Tags Packages
// @Produce json
// @Security BearerAuth
// @Param business_id query int false "Solo super admin: negocio a consultar"
// @Success 200 {object} response.PackagesSummaryResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /horizontal-properties/packages/summary [get]
func (h *PackageHandler) GetPackagesSummary(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "GetPackagesSummary")

	businessID, exists, bizErr := resolveBusinessID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{Success: false, Message: "business_id no disponible"})
		return
	}
	if bizErr != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: bizErr.Error()})
		return
	}

	summary, err := h.useCase.GetPackagesSummary(ctx, businessID, time.Now())
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error contando paquetes", Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, response.PackagesSummaryResponse{
		Success: true,
		Data: response.PackagesSummaryData{
			Pending:        summary.Pending,
			PendingOverdue: summary.PendingOverdue,
			DeliveredToday: summary.DeliveredToday,
			Delivered:      summary.Delivered,
			Closed:         summary.Closed,
			Total:          summary.Total,
		},
	})
}
