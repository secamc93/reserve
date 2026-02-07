package handlers

import (
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/sporttraining/guardian/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func (h *GuardianHandler) GetPlayerGuardians(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "GetPlayerGuardians")

	businessID, exists := middleware.GetBusinessID(c)
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

	guardians, err := h.useCase.GetPlayerGuardians(ctx, uint(playerID), businessID)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error obteniendo tutores del jugador")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error obteniendo tutores del jugador",
			Error:   err.Error(),
		})
		return
	}

	guardianData := make([]response.PlayerGuardianData, len(guardians))
	for i, g := range guardians {
		guardianData[i] = response.PlayerGuardianData{
			ID:                  g.ID,
			FirstName:           g.FirstName,
			LastName:            g.LastName,
			DocumentNumber:      g.DocumentNumber,
			Email:               g.Email,
			Phone:               g.Phone,
			RelationshipType:    g.RelationshipType,
			IsPrimaryGuardian:   g.IsPrimaryGuardian,
			CanPickup:           g.CanPickup,
			CanBookSessions:     g.CanBookSessions,
			HasMedicalAuthority: g.HasMedicalAuthority,
			StartDate:           g.StartDate,
		}
	}

	c.JSON(http.StatusOK, response.PlayerGuardiansResponse{
		Success: true,
		Data:    guardianData,
	})
}
