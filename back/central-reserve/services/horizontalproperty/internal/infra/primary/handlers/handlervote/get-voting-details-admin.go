package handlervote

import (
	"fmt"
	"net/http"
	"os"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// GetVotingDetailsAdmin godoc
//
//		@Summary		Obtener detalles completos de votación (Admin)
//		@Description	Obtiene TODAS las unidades con número, residente principal, coeficiente de participación, y estado de votación (si votó, qué opción eligió, cuándo votó)
//		@Tags			Votaciones
//		@Accept			json
//		@Produce		json
//		@Security		BearerAuth
//		@Param			group_id	path		int	true	"ID del grupo de votación"
//		@Param			voting_id	path		int	true	"ID de la votación"
//	 	@Param          business_id	query		int	false	"ID del business (opcional para super admin)"
//		@Success		200			{object}	object
//		@Failure		400			{object}	object
//		@Failure		500			{object}	object
//		@Router			/horizontal-properties/voting-groups/{group_id}/votings/{voting_id}/voting-details [get]
func (h *VotingHandler) GetVotingDetailsAdmin(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "GetVotingDetailsAdmin")
	fmt.Printf("\n📊 [ADMIN - DETALLES DE VOTACION POR UNIDAD]\n")

	// Determinar business_id: del token para usuarios normales; query param opcional para super admin
	var businessID uint
	isSuper := middleware.IsSuperAdmin(c)
	if isSuper {
		q := c.Query("business_id")
		if q == "" {
			h.logger.Error(ctx).Msg("business_id requerido para super admin")
			c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "business_id requerido", Error: "Proporcione ?business_id"})
			return
		}
		id64, err := strconv.ParseUint(q, 10, 32)
		if err != nil || id64 == 0 {
			h.logger.Error(ctx).Str("business_id", q).Msg("Business ID inválido")
			c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "business_id inválido", Error: "Debe ser numérico y > 0"})
			return
		}
		businessID = uint(id64)
	} else {
		bid, ok := middleware.GetBusinessID(c)
		if !ok || bid == 0 {
			h.logger.Error(ctx).Msg("Business ID no disponible en token")
			c.JSON(http.StatusUnauthorized, response.ErrorResponse{Success: false, Message: "token inválido", Error: "business_id no encontrado"})
			return
		}
		businessID = bid
	}

	votingIDParam := c.Param("voting_id")
	votingID, err := strconv.ParseUint(votingIDParam, 10, 32)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] GetVotingDetailsAdmin - Error parseando Voting ID: %v\n", err)
		h.logger.Error(ctx).Err(err).Str("voting_id", votingIDParam).Msg("Error parseando Voting ID")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de votación inválido",
			Error:   "Debe ser numérico",
		})
		return
	}

	fmt.Printf("   Business ID: %d\n", businessID)
	fmt.Printf("   Voting ID: %d\n\n", votingID)

	// Obtener detalles por unidad
	fmt.Printf("🔍 [CONSULTANDO] Detalles de todas las unidades...\n")
	details, err := h.votingUseCase.GetVotingDetailsByUnit(ctx, uint(votingID), businessID)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] GetVotingDetailsAdmin - Error obteniendo detalles: %v\n", err)
		h.logger.Error(ctx).Err(err).Uint("voting_id", uint(votingID)).Uint("business_id", businessID).Msg("Error obteniendo detalles de votación")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error obteniendo detalles de votación",
			Error:   err.Error(),
		})
		return
	}

	// Mapear a response
	detailsResponse := mapper.MapVotingDetailsByUnitToResponses(details)

	// Calcular estadísticas
	totalUnits := len(details)
	unitsVoted := 0
	for _, detail := range details {
		if detail.HasVoted {
			unitsVoted++
		}
	}

	fmt.Printf("   ✅ Total de unidades: %d\n", totalUnits)
	fmt.Printf("   ✅ Unidades que votaron: %d\n", unitsVoted)
	fmt.Printf("   ✅ Unidades pendientes: %d\n\n", totalUnits-unitsVoted)

	h.logger.Info(ctx).
		Uint("business_id", businessID).
		Uint("voting_id", uint(votingID)).
		Int("total_units", totalUnits).
		Int("units_voted", unitsVoted).
		Msg("✅ Detalles de votación obtenidos para admin")

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Detalles de votación obtenidos exitosamente",
		"data": gin.H{
			"units":         detailsResponse,
			"total_units":   totalUnits,
			"units_voted":   unitsVoted,
			"units_pending": totalUnits - unitsVoted,
		},
	})
}
