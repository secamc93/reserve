package handlers

import (
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/sporttraining/session/internal/domain"
	"central_reserve/services/sporttraining/session/internal/infra/primary/handlers/mappers"
	"central_reserve/services/sporttraining/session/internal/infra/primary/handlers/request"
	"central_reserve/services/sporttraining/session/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func (h *SessionHandler) CancelSession(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "CancelSession")

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

	var req request.CancelSessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	dto := domain.CancelSessionDTO{
		ID:         uint(id),
		BusinessID: businessID,
		Reason:     req.Reason,
	}

	session, err := h.useCase.CancelSession(ctx, dto)
	if err != nil {
		if err == domain.ErrSessionNotFound {
			c.JSON(http.StatusNotFound, response.ErrorResponse{
				Success: false,
				Message: "Sesión no encontrada",
			})
			return
		}

		if err == domain.ErrSessionAlreadyCancelled {
			c.JSON(http.StatusBadRequest, response.ErrorResponse{
				Success: false,
				Message: "La sesión ya está cancelada",
			})
			return
		}

		h.logger.Error(ctx).Err(err).Msgf("Error cancelando sesión %d", id)
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error cancelando sesión",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.SessionResponse{
		Success: true,
		Data:    mappers.SessionToResponse(session),
	})
}
