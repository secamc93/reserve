package handlervote

import (
	"fmt"
	"net/http"
	"os"
	"strconv"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/response"

	"github.com/gin-gonic/gin"
)

// DeleteVoteAdmin godoc
//
//	@Summary		Eliminar voto (admin)
//	@Description	Elimina un voto específico. Solo para administradores autenticados.
//	@Tags			Votaciones
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			group_id	path		int	true	"ID del grupo de votación"
//	@Param			voting_id	path		int	true	"ID de la votación"
//	@Param			vote_id		path		int	true	"ID del voto a eliminar"
//	@Success		200			{object}	object
//	@Failure		400			{object}	object
//	@Failure		401			{object}	object
//	@Failure		404			{object}	object
//	@Failure		500			{object}	object
//	@Router			/horizontal-properties/voting-groups/{group_id}/votings/{voting_id}/votes/{vote_id} [delete]
func (h *VotingHandler) DeleteVoteAdmin(c *gin.Context) {
	// Extraer vote_id del path
	voteIDParam := c.Param("vote_id")
	voteID, err := strconv.ParseUint(voteIDParam, 10, 32)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/delete-vote-admin.go - Error parseando vote_id: %v\n", err)
		h.logger.Error().Err(err).Str("vote_id", voteIDParam).Msg("Error parseando ID del voto")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de voto inválido",
			Error:   "El ID del voto debe ser numérico",
		})
		return
	}

	// Extraer voting_id del path
	votingIDParam := c.Param("voting_id")
	votingID, err := strconv.ParseUint(votingIDParam, 10, 32)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/delete-vote-admin.go - Error parseando voting_id: %v\n", err)
		h.logger.Error().Err(err).Str("voting_id", votingIDParam).Msg("Error parseando ID de la votación")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de votación inválido",
			Error:   "El ID de la votación debe ser numérico",
		})
		return
	}

	fmt.Printf("\n🗑️ [VOTACION ADMIN - ELIMINANDO VOTO]\n")
	fmt.Printf("   Votación ID: %d\n", uint(votingID))
	fmt.Printf("   Voto ID: %d\n", uint(voteID))
	fmt.Printf("   Verificando voto...\n\n")

	// Verificar que el voto existe y pertenece a la votación correcta
	vote, err := h.votingRepository.GetVoteByID(c.Request.Context(), uint(voteID))
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/delete-vote-admin.go - Error obteniendo voto: %v\n", err)
		h.logger.Error().Err(err).Uint("vote_id", uint(voteID)).Msg("Error obteniendo voto")
		c.JSON(http.StatusNotFound, response.ErrorResponse{
			Success: false,
			Message: "Voto no encontrado",
			Error:   "El voto especificado no existe",
		})
		return
	}

	// Verificar que el voto pertenece a la votación correcta
	if vote.VotingID != uint(votingID) {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/delete-vote-admin.go - Voto no pertenece a la votación: vote_voting_id=%d, expected_voting_id=%d\n", vote.VotingID, uint(votingID))
		h.logger.Error().Uint("vote_voting_id", vote.VotingID).Uint("expected_voting_id", uint(votingID)).Msg("Voto no pertenece a la votación")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Voto no válido",
			Error:   "El voto no pertenece a esta votación",
		})
		return
	}

	fmt.Printf("✅ [VOTACION ADMIN - VOTO VERIFICADO]\n")
	fmt.Printf("   Voto ID: %d\n", vote.ID)
	fmt.Printf("   Votación ID: %d\n", vote.VotingID)
	fmt.Printf("   Unidad ID: %d\n", vote.PropertyUnitID)
	fmt.Printf("   Eliminando permanentemente...\n\n")

	// Eliminar el voto
	if err := h.votingUseCase.DeleteVote(c.Request.Context(), uint(voteID)); err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/delete-vote-admin.go - Error eliminando voto: %v\n", err)
		h.logger.Error().Err(err).Uint("vote_id", uint(voteID)).Msg("Error eliminando voto")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error eliminando voto",
			Error:   err.Error(),
		})
		return
	}

	// Notificar eliminación en el cache para SSE (tiempo real)
	if err := h.votingCache.RemoveVote(uint(votingID), uint(voteID)); err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/delete-vote-admin.go - Error removiendo voto del cache: %v\n", err)
		h.logger.Error().Err(err).Uint("vote_id", uint(voteID)).Msg("Error removiendo voto del cache")
		// No retornamos error, el voto ya fue eliminado de BD
	} else {
		fmt.Printf("📡 [VOTACION ADMIN - VOTO REMOVIDO DEL CACHE]\n")
		fmt.Printf("   Cache actualizado para streaming en tiempo real\n\n")
	}

	fmt.Printf("✅ [VOTACION ADMIN - VOTO ELIMINADO]\n")
	fmt.Printf("   Voto ID: %d\n", uint(voteID))
	fmt.Printf("   Votación ID: %d\n", uint(votingID))
	fmt.Printf("   El residente puede volver a votar\n\n")

	h.logger.Info().
		Uint("vote_id", uint(voteID)).
		Uint("voting_id", uint(votingID)).
		Msg("✅ [VOTACION ADMIN] Voto eliminado exitosamente")

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Voto eliminado exitosamente",
		"data": gin.H{
			"vote_id":    uint(voteID),
			"voting_id":  uint(votingID),
			"deleted_at": "now",
		},
	})
}
