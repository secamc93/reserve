package handlers

import (
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/sporttraining/guardian/internal/domain"
	"central_reserve/services/sporttraining/guardian/internal/infra/primary/handlers/request"
	"central_reserve/services/sporttraining/guardian/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func (h *GuardianHandler) AssignGuardianToPlayer(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "AssignGuardianToPlayer")

	_, exists := middleware.GetBusinessID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "business_id no disponible",
		})
		return
	}

	playerID, err := strconv.ParseUint(c.Param("player_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "player_id inválido",
		})
		return
	}

	var req request.AssignGuardianRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	dto := domain.AssignGuardianDTO{
		PlayerID:            uint(playerID),
		GuardianID:          req.GuardianID,
		RelationshipType:    req.RelationshipType,
		IsPrimaryGuardian:   req.IsPrimaryGuardian,
		CanPickup:           req.CanPickup,
		CanBookSessions:     req.CanBookSessions,
		HasMedicalAuthority: req.HasMedicalAuthority,
	}

	err = h.useCase.AssignGuardianToPlayer(ctx, dto)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error asignando tutor a jugador")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error asignando tutor a jugador",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.SuccessResponse{
		Success: true,
		Message: "Tutor asignado exitosamente",
	})
}
