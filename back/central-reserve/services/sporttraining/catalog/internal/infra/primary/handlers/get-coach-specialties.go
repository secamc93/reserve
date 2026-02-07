package handlers

import (
	"central_reserve/services/sporttraining/catalog/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (h *CatalogHandler) GetCoachSpecialties(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "GetCoachSpecialties")

	specialties, err := h.useCase.GetCoachSpecialties(ctx)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error obteniendo especialidades")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error obteniendo especialidades",
		})
		return
	}

	data := make([]response.CoachSpecialtyData, len(specialties))
	for i, s := range specialties {
		data[i] = response.CoachSpecialtyData{
			ID:          s.ID,
			Name:        s.Name,
			Code:        s.Code,
			Description: s.Description,
			Icon:        s.Icon,
		}
	}

	c.JSON(http.StatusOK, response.CatalogListResponse{
		Success: true,
		Data:    data,
	})
}
