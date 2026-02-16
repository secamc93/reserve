package handlervotes

import (
	"net/http"
	"strconv"

	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// ResetVoting godoc
// @Summary Resetear votación
// @Description Elimina todos los votos de una votación (mantiene asistencia)
// @Tags votes
// @Produce json
// @Param voting_id path int true "ID de la votación"
// @Success 200 {object} response.ResetVotingSuccess
// @Failure 400 {object} response.ErrorResponse
// @Router /horizontal-properties/voting-groups/{group_id}/votings/{voting_id}/votes/reset [delete]
func (h *VotesHandler) ResetVoting(c *gin.Context) {
	votingIDStr := c.Param("voting_id")
	votingID, err := strconv.ParseUint(votingIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de votación inválido",
			Error:   err.Error(),
		})
		return
	}

	result, err := h.votingUseCase.ResetVoting(c.Request.Context(), uint(votingID))
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Error reseteando votación",
			Error:   err.Error(),
		})
		return
	}

	resultResponse := mappers.MapResetVotingResultDTOToResponse(result)

	c.JSON(http.StatusOK, response.ResetVotingSuccess{
		Success: true,
		Message: "Votación reseteada exitosamente",
		Data:    resultResponse,
	})
}
