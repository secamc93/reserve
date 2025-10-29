package handlervote

import (
	"fmt"
	"net/http"
	"os"
	"strconv"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/response"

	"github.com/gin-gonic/gin"
)

// DeactivateVotingOption godoc
//
//	@Summary		Desactivar una opción de votación
//	@Description	Desactiva una opción de votación existente
//	@Tags			Votaciones
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			group_id	path		int	true	"ID del grupo de votación"
//	@Param			voting_id	path		int	true	"ID de la votación"
//	@Param			option_id	path		int	true	"ID de la opción de votación"
//	@Success		200			{object}	object
//	@Failure		400			{object}	object
//	@Failure		404			{object}	object
//	@Failure		500			{object}	object
//	@Router			/horizontal-properties/voting-groups/{group_id}/votings/{voting_id}/options/{option_id} [delete]
func (h *VotingHandler) DeactivateVotingOption(c *gin.Context) {
	idParam := c.Param("option_id")
	id64, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/deactivate-voting-option.go - Error en handler: %v\n", err)
		h.logger.Error().Err(err).Str("option_id", idParam).Msg("Error parseando ID de opción de votación")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "id inválido", Error: "Debe ser numérico"})
		return
	}
	if err := h.votingUseCase.DeactivateVotingOption(c.Request.Context(), uint(id64)); err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/deactivate-voting-option.go - Error en handler: %v\n", err)
		h.logger.Error().Err(err).Uint("option_id", uint(id64)).Msg("Error desactivando opción de votación")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "No se pudo desactivar", Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Opción desactivada"})
}
