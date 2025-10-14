package handlervote

import (
	"fmt"
	"net/http"
	"os"
	"strconv"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/response"

	"github.com/gin-gonic/gin"
)

// GetVotingDetailsAdmin godoc
//
//	@Summary		Obtener detalles completos de votación (Admin)
//	@Description	Obtiene TODAS las unidades con número, residente principal, coeficiente de participación, y estado de votación (si votó, qué opción eligió, cuándo votó)
//	@Tags			Votaciones
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			hp_id		path		int	true	"ID de la propiedad horizontal"
//	@Param			group_id	path		int	true	"ID del grupo de votación"
//	@Param			voting_id	path		int	true	"ID de la votación"
//	@Success		200			{object}	object
//	@Failure		400			{object}	object
//	@Failure		500			{object}	object
//	@Router			/horizontal-properties/{hp_id}/voting-groups/{group_id}/votings/{voting_id}/voting-details [get]
func (h *VotingHandler) GetVotingDetailsAdmin(c *gin.Context) {
	fmt.Printf("\n📊 [ADMIN - DETALLES DE VOTACION POR UNIDAD]\n")

	// Parsear IDs
	hpIDParam := c.Param("hp_id")
	hpID, err := strconv.ParseUint(hpIDParam, 10, 32)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] GetVotingDetailsAdmin - Error parseando HP ID: %v\n", err)
		h.logger.Error().Err(err).Str("hp_id", hpIDParam).Msg("Error parseando HP ID")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de propiedad horizontal inválido",
			Error:   "Debe ser numérico",
		})
		return
	}

	votingIDParam := c.Param("voting_id")
	votingID, err := strconv.ParseUint(votingIDParam, 10, 32)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] GetVotingDetailsAdmin - Error parseando Voting ID: %v\n", err)
		h.logger.Error().Err(err).Str("voting_id", votingIDParam).Msg("Error parseando Voting ID")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de votación inválido",
			Error:   "Debe ser numérico",
		})
		return
	}

	fmt.Printf("   HP ID: %d\n", hpID)
	fmt.Printf("   Voting ID: %d\n\n", votingID)

	// Obtener detalles por unidad
	fmt.Printf("🔍 [CONSULTANDO] Detalles de todas las unidades...\n")
	details, err := h.votingUseCase.GetVotingDetailsByUnit(c.Request.Context(), uint(votingID), uint(hpID))
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] GetVotingDetailsAdmin - Error obteniendo detalles: %v\n", err)
		h.logger.Error().Err(err).Uint("voting_id", uint(votingID)).Uint("hp_id", uint(hpID)).Msg("Error obteniendo detalles de votación")
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

	h.logger.Info().
		Uint("hp_id", uint(hpID)).
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
