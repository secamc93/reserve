package handlers

import (
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/sporttraining/session/internal/domain"
	"central_reserve/services/sporttraining/session/internal/infra/primary/handlers/mappers"
	"central_reserve/services/sporttraining/session/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func (h *SessionHandler) GetSessionByID(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "GetSessionByID")

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

	session, err := h.useCase.GetSessionByID(ctx, uint(id), businessID)
	if err != nil {
		if err == domain.ErrSessionNotFound {
			c.JSON(http.StatusNotFound, response.ErrorResponse{
				Success: false,
				Message: "Sesión no encontrada",
			})
			return
		}

		h.logger.Error(ctx).Err(err).Msgf("Error obteniendo sesión %d", id)
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error obteniendo sesión",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.SessionResponse{
		Success: true,
		Data:    mappers.SessionToResponse(session),
	})
}
