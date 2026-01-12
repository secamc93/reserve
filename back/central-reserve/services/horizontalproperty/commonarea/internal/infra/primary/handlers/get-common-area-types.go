package handlers

import (
	"net/http"

	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// GetCommonAreaTypes obtiene todos los tipos de zonas comunes
func (h *CommonAreaHandler) GetCommonAreaTypes(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "GetCommonAreaTypes")

	types, err := h.useCase.GetCommonAreaTypes(ctx)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error obteniendo tipos de zonas comunes")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error obteniendo tipos de zonas comunes",
			Error:   err.Error(),
		})
		return
	}

	typeResponses := make([]response.CommonAreaTypeResponse, len(types))
	for i, t := range types {
		typeResponses[i] = response.CommonAreaTypeResponse{
			ID:                 t.ID,
			Name:               t.Name,
			Code:               t.Code,
			Description:        t.Description,
			Icon:               t.Icon,
			DefaultMaxCapacity: t.DefaultMaxCapacity,
			RequiresApproval:   t.RequiresApproval,
			AllowsRecurring:    t.AllowsRecurring,
			IsActive:           t.IsActive,
		}
	}

	c.JSON(http.StatusOK, response.CommonAreaTypesResponse{
		Success: true,
		Data:    typeResponses,
	})
}
