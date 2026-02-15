package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/sporttraining/player/internal/domain"
	"central_reserve/services/sporttraining/player/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func (h *PlayerHandler) DeletePlayer(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "DeletePlayer")

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

	if err := h.useCase.DeletePlayer(ctx, uint(id), businessID); err != nil {
		if errors.Is(err, domain.ErrPlayerNotFound) {
			c.JSON(http.StatusNotFound, response.ErrorResponse{
				Success: false,
				Message: err.Error(),
			})
			return
		}
		h.logger.Error(ctx).Err(err).Msg("Error eliminando jugador")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error eliminando jugador",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.SuccessResponse{
		Success: true,
		Message: "Jugador eliminado exitosamente",
	})
}
