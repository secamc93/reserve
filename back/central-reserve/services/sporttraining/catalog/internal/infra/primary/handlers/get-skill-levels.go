package handlers

import (
	"central_reserve/services/sporttraining/catalog/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (h *CatalogHandler) GetSkillLevels(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "GetSkillLevels")

	levels, err := h.useCase.GetSkillLevels(ctx)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error obteniendo niveles de habilidad")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error obteniendo niveles de habilidad",
		})
		return
	}

	data := make([]response.SkillLevelData, len(levels))
	for i, l := range levels {
		data[i] = response.SkillLevelData{
			ID:          l.ID,
			Name:        l.Name,
			Code:        l.Code,
			Description: l.Description,
			Level:       l.Level,
			Color:       l.Color,
		}
	}

	c.JSON(http.StatusOK, response.CatalogListResponse{
		Success: true,
		Data:    data,
	})
}
