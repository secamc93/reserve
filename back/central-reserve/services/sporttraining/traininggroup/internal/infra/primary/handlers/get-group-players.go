package handlers

import (
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/sporttraining/traininggroup/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func (h *GroupHandler) GetGroupPlayers(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "GetGroupPlayers")

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

	players, err := h.useCase.GetGroupPlayers(ctx, uint(groupID), businessID)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error obteniendo jugadores del grupo")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error obteniendo jugadores del grupo",
			Error:   err.Error(),
		})
		return
	}

	data := make([]response.GroupPlayerData, len(players))
	for i, p := range players {
		data[i] = response.GroupPlayerData{
			PlayerID:       p.PlayerID,
			FirstName:      p.FirstName,
			LastName:       p.LastName,
			EnrollmentDate: p.EnrollmentDate,
			IsActive:       p.IsActive,
		}
	}

	c.JSON(http.StatusOK, response.GroupPlayersResponse{
		Success: true,
		Data:    data,
	})
}
