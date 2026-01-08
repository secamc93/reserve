package handlers

import (
	"net/http"
	"strconv"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/services/horizontalproperty/visit/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// DeleteVisit elimina una visita (soft delete - cambia estado a cancelled)
// @Summary Eliminar visita
// @Description Cancela una visita (soft delete)
// @Tags Visits
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param visit_id path int true "ID de la visita"
// @Success 200 {object} response.SuccessResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /horizontal-properties/visits/{visit_id} [delete]
func (h *VisitHandler) DeleteVisit(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "DeleteVisit")

	visitIDParam := c.Param("visit_id")
	visitID, err := strconv.ParseUint(visitIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de visita inválido",
		})
		return
	}

	err = h.useCase.DeleteVisit(ctx, uint(visitID))
	if err != nil {
		if err == domain.ErrVisitNotFound {
			c.JSON(http.StatusNotFound, response.ErrorResponse{
				Success: false,
				Message: "Visita no encontrada",
			})
			return
		}
		if err == domain.ErrVisitNotInProgress {
			c.JSON(http.StatusBadRequest, response.ErrorResponse{
				Success: false,
				Message: "No se puede cancelar una visita en progreso",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error eliminando visita",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.SuccessResponse{
		Success: true,
		Message: "Visita cancelada correctamente",
	})
}
