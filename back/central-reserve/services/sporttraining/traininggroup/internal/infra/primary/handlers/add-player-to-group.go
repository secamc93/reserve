package handlers

import (
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/sporttraining/traininggroup/internal/domain"
	"central_reserve/services/sporttraining/traininggroup/internal/infra/primary/handlers/request"
	"central_reserve/services/sporttraining/traininggroup/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func (h *GroupHandler) AddPlayerToGroup(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "AddPlayerToGroup")

	_, exists := middleware.GetBusinessID(c)
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

	var req request.AddPlayerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	dto := domain.AddPlayerDTO{
		GroupID:  uint(groupID),
		PlayerID: req.PlayerID,
		Notes:    req.Notes,
	}

	err = h.useCase.AddPlayerToGroup(ctx, dto)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error agregando jugador al grupo")
		statusCode := http.StatusInternalServerError
		if err == domain.ErrGroupFull {
			statusCode = http.StatusBadRequest
		} else if err == domain.ErrPlayerAlreadyInGroup {
			statusCode = http.StatusConflict
		}
		c.JSON(statusCode, response.ErrorResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, response.SuccessResponse{
		Success: true,
		Message: "Jugador agregado exitosamente al grupo",
	})
}
