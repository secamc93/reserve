package handlers

import (
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/sporttraining/guardian/internal/infra/primary/handlers/mappers"
	"central_reserve/services/sporttraining/guardian/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func (h *GuardianHandler) GetGuardianByID(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "GetGuardianByID")

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

	guardian, err := h.useCase.GetGuardianByID(ctx, uint(id), businessID)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error obteniendo tutor")
		c.JSON(http.StatusNotFound, response.ErrorResponse{
			Success: false,
			Message: "Tutor no encontrado",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.GuardianResponse{
		Success: true,
		Data:    mappers.GuardianToResponse(guardian),
	})
}
