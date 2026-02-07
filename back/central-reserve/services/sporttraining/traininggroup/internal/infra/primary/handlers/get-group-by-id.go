package handlers

import (
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/sporttraining/traininggroup/internal/infra/primary/handlers/mappers"
	"central_reserve/services/sporttraining/traininggroup/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func (h *GroupHandler) GetGroupByID(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "GetGroupByID")

	businessID, exists := middleware.GetBusinessID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "business_id no disponible",
		})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID inválido",
		})
		return
	}

	group, err := h.useCase.GetGroupByID(ctx, uint(id), businessID)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error obteniendo grupo de entrenamiento")
		c.JSON(http.StatusNotFound, response.ErrorResponse{
			Success: false,
			Message: "Grupo de entrenamiento no encontrado",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.GroupResponse{
		Success: true,
		Data:    mappers.GroupToResponse(group),
	})
}
