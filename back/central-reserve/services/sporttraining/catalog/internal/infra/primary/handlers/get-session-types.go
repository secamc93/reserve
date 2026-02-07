package handlers

import (
	"central_reserve/services/sporttraining/catalog/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (h *CatalogHandler) GetSessionTypes(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "GetSessionTypes")

	types, err := h.useCase.GetSessionTypes(ctx)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error obteniendo tipos de sesión")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error obteniendo tipos de sesión",
		})
		return
	}

	data := make([]response.SessionTypeData, len(types))
	for i, t := range types {
		data[i] = response.SessionTypeData{
			ID:               t.ID,
			Name:             t.Name,
			Code:             t.Code,
			Description:      t.Description,
			DefaultDuration:  t.DefaultDuration,
			DefaultPrice:     t.DefaultPrice,
			AllowsIndividual: t.AllowsIndividual,
			AllowsGroup:      t.AllowsGroup,
			Icon:             t.Icon,
			Color:            t.Color,
		}
	}

	c.JSON(http.StatusOK, response.CatalogListResponse{
		Success: true,
		Data:    data,
	})
}
