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

// ListVotes godoc
//
//	@Summary		Listar votos de una votación
//	@Description	Obtiene la lista de votos registrados en una votación específica
//	@Tags			Votaciones
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			group_id	path		int	true	"ID del grupo de votación"
//	@Param			voting_id	path		int	true	"ID de la votación"
//	@Success		200			{object}	object
//	@Failure		400			{object}	object
//	@Failure		500			{object}	object
//	@Router			/horizontal-properties/voting-groups/{group_id}/votings/{voting_id}/votes [get]
func (h *VotingHandler) ListVotes(c *gin.Context) {
	idParam := c.Param("voting_id")
	id64, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/list-votes.go - Error en handler: %v\n", err)
		h.logger.Error().Err(err).Str("voting_id", idParam).Msg("Error parseando ID de votación")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "id inválido", Error: "Debe ser numérico"})
		return
	}
	votes, err := h.votingUseCase.ListVotesByVoting(c.Request.Context(), uint(id64))
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/list-votes.go - Error en handler: %v\n", err)
		h.logger.Error().Err(err).Uint("voting_id", uint(id64)).Msg("Error listando votos")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error listando votos", Error: err.Error()})
		return
	}

	// Mapear DTOs a responses
	responseData := mapper.MapVoteDTOsToResponses(votes)
	c.JSON(http.StatusOK, response.VotesSuccess{Success: true, Message: "Votos obtenidos", Data: responseData})
}
