package handlers

import (
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/sporttraining/traininggroup/internal/domain"
	"central_reserve/services/sporttraining/traininggroup/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func (h *GroupHandler) RemovePlayerFromGroup(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "RemovePlayerFromGroup")

	businessID, exists := middleware.GetBusinessID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "business_id no disponible",
		})
		return
	}

	groupID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de grupo inválido",
		})
		return
	}

	playerID, err := strconv.ParseUint(c.Param("player_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de jugador inválido",
		})
		return
	}

	err = h.useCase.RemovePlayerFromGroup(ctx, uint(groupID), uint(playerID), businessID)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error removiendo jugador del grupo")
		statusCode := http.StatusInternalServerError
		if err == domain.ErrPlayerNotInGroup {
			statusCode = http.StatusNotFound
		}
		c.JSON(statusCode, response.ErrorResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.SuccessResponse{
		Success: true,
		Message: "Jugador removido exitosamente del grupo",
	})
}
