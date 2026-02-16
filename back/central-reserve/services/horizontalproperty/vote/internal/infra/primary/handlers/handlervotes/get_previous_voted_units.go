package handlervotes

import (
	"net/http"
	"strconv"

	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// GetPreviousVotingVotedUnits godoc
// @Summary Obtener unidades que votaron en la votación anterior
// @Description Busca la votación anterior en el mismo grupo y retorna las unidades que votaron
// @Tags votes
// @Produce json
// @Param group_id path int true "ID del grupo de votación"
// @Param voting_id path int true "ID de la votación actual"
// @Success 200 {object} response.PreviousVotingVotedUnitsSuccess
// @Failure 400 {object} response.ErrorResponse
// @Router /horizontal-properties/voting-groups/{group_id}/votings/{voting_id}/votes/previous-voted-units [get]
func (h *VotesHandler) GetPreviousVotingVotedUnits(c *gin.Context) {
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

	groupIDStr := c.Param("group_id")
	groupID, err := strconv.ParseUint(groupIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de grupo inválido",
			Error:   err.Error(),
		})
		return
	}

	result, err := h.votingUseCase.GetPreviousVotingVotedUnits(c.Request.Context(), uint(votingID), uint(groupID))
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Error obteniendo unidades de votación anterior",
			Error:   err.Error(),
		})
		return
	}

	resultResponse := mappers.MapPreviousVotingVotedUnitsDTOToResponse(result)

	c.JSON(http.StatusOK, response.PreviousVotingVotedUnitsSuccess{
		Success: true,
		Message: "Unidades de votación anterior obtenidas",
		Data:    resultResponse,
	})
}
