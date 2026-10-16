package handlers

import (
	"net/http"
	"time"

	"central_reserve/services/horizontalproperty/visit/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// colombia es la zona de las propiedades (UTC-5, sin horario de verano): define "hoy".
var colombia = time.FixedZone("America/Bogota", -5*3600)

// GetVisitsSummary cuenta las visitas de un día por estado de portería
// @Summary Resumen de visitas del día
// @Description Conteos para los chips de la portería: dentro, esperadas, salieron y canceladas (del día) y visitantes dentro ahora
// @Tags Visits
// @Produce json
// @Security BearerAuth
// @Param date query string false "Día (YYYY-MM-DD); por defecto hoy en hora de Colombia"
// @Param business_id query int false "Solo super admin: negocio a consultar"
// @Success 200 {object} response.VisitsSummaryResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /horizontal-properties/visits/summary [get]
func (h *VisitHandler) GetVisitsSummary(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "GetVisitsSummary")

	businessID, exists, bizErr := resolveBusinessID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{Success: false, Message: "business_id no disponible"})
		return
	}
	if bizErr != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: bizErr.Error()})
		return
	}

	day := time.Now().In(colombia)
	if raw := c.Query("date"); raw != "" {
		parsed, err := time.Parse("2006-01-02", raw)
		if err != nil {
			c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "date inválida (YYYY-MM-DD)"})
			return
		}
		day = parsed
	}

	summary, err := h.useCase.GetVisitsSummary(ctx, businessID, day)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error contando visitas", Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, response.VisitsSummaryResponse{
		Success: true,
		Data: response.VisitsSummaryData{
			Date:           day.Format("2006-01-02"),
			Inside:         summary.Inside,
			Expected:       summary.Expected,
			Left:           summary.Left,
			Cancelled:      summary.Cancelled,
			Total:          summary.Total,
			InsideNow:      summary.InsideNow,
			Exceeded:       summary.Exceeded,
			NextExpectedAt: summary.NextExpectedAt,
			NextUnitNumber: summary.NextUnitNumber,
			NextUnitBlock:  summary.NextUnitBlock,
			AvgStayMinutes: summary.AvgStayMinutes,
		},
	})
}
