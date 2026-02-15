package handlers

import (
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/sporttraining/coach/internal/domain"
	"central_reserve/services/sporttraining/coach/internal/infra/primary/handlers/mappers"
	"central_reserve/services/sporttraining/coach/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func (h *CoachHandler) GetCoachByID(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "GetCoachByID")

	businessID, exists := middleware.GetBusinessID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "business_id no disponible",
		})
		return
	}

	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID inválido",
		})
		return
	}

	coach, err := h.useCase.GetCoachByID(ctx, uint(id), businessID)
	if err != nil {
		if err == domain.ErrCoachNotFound {
			c.JSON(http.StatusNotFound, response.ErrorResponse{
				Success: false,
				Message: "Entrenador no encontrado",
			})
			return
		}
		h.logger.Error(ctx).Err(err).Msg("Error obteniendo entrenador")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error obteniendo entrenador",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.CoachResponse{
		Success: true,
		Data:    mappers.CoachToResponse(coach),
	})
}
