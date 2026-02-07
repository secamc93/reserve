package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/sporttraining/player/internal/domain"
	"central_reserve/services/sporttraining/player/internal/infra/primary/handlers/mappers"
	"central_reserve/services/sporttraining/player/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func (h *PlayerHandler) GetPlayerByID(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "GetPlayerByID")

	businessID, exists := middleware.GetBusinessID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "business_id no disponible",
		})
		return
	}

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID inválido",
		})
		return
	}

	player, err := h.useCase.GetPlayerByID(ctx, uint(id), businessID)
	if err != nil {
		if errors.Is(err, domain.ErrPlayerNotFound) {
			c.JSON(http.StatusNotFound, response.ErrorResponse{
				Success: false,
				Message: err.Error(),
			})
			return
		}
		h.logger.Error(ctx).Err(err).Msg("Error obteniendo jugador")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error obteniendo jugador",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.PlayerResponse{
		Success: true,
		Data:    mappers.PlayerToResponse(player),
	})
}
