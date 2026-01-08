package handlers

import (
	"net/http"

	"central_reserve/services/horizontalproperty/visit/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// ListVisitStatuses obtiene todos los estados de visita
// @Summary Listar estados de visita
// @Description Obtiene todos los estados de visita activos
// @Tags Visits
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.VisitStatusesResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /horizontal-properties/visits/statuses [get]
func (h *VisitHandler) ListVisitStatuses(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "ListVisitStatuses")

	statuses, err := h.useCase.GetVisitStatuses(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error obteniendo estados de visita",
			Error:   err.Error(),
		})
		return
	}

	data := make([]response.VisitStatusData, len(statuses))
	for i, s := range statuses {
		data[i] = response.VisitStatusData{
			ID:          s.ID,
			Code:        s.Code,
			Name:        s.Name,
			Description: s.Description,
			IsFinal:     s.IsFinal,
			IsActive:    s.IsActive,
		}
	}

	c.JSON(http.StatusOK, response.VisitStatusesResponse{
		Success: true,
		Data:    data,
	})
}
