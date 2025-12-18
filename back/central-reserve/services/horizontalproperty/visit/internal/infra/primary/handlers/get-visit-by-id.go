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
	_, err := strconv.ParseUint(visitIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de visita inválido",
		})
		return
	}

	// Necesitamos agregar método GetVisitByID al useCase
	// Por ahora, retornamos error
	c.JSON(http.StatusNotImplemented, response.ErrorResponse{
		Success: false,
		Message: "Obtener visita por ID no implementado aún",
	})
}
