package handlers

import (
	"central_reserve/services/sporttraining/catalog/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (h *CatalogHandler) GetAttendanceStatuses(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "GetAttendanceStatuses")

	statuses, err := h.useCase.GetAttendanceStatuses(ctx)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error obteniendo estados de asistencia")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error obteniendo estados de asistencia",
		})
		return
	}

	data := make([]response.StatusData, len(statuses))
	for i, s := range statuses {
		data[i] = response.StatusData{
			ID:          s.ID,
			Name:        s.Name,
			Code:        s.Code,
			Description: s.Description,
			Color:       s.Color,
			Icon:        s.Icon,
		}
	}

	c.JSON(http.StatusOK, response.CatalogListResponse{
		Success: true,
		Data:    data,
	})
}
