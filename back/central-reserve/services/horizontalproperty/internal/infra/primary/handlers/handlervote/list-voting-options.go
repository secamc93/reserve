package handlervote

import (
	"net/http"
	"strconv"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/response"

	"github.com/gin-gonic/gin"
)

// ListVotingOptions godoc
// @Summary Listar opciones de votación
// @Description Obtiene la lista de opciones de una votación específica
// @Tags Votaciones
// @Accept json
// @Produce json
// @Param hp_id path int true "ID de la propiedad horizontal"
// @Param group_id path int true "ID del grupo de votación"
// @Param voting_id path int true "ID de la votación"
// @Success 200 {object} object
// @Failure 400 {object} object
// @Failure 500 {object} object
// @Router /horizontal-properties/{hp_id}/voting-groups/{group_id}/votings/{voting_id}/options [get]
func (h *VotingHandler) ListVotingOptions(c *gin.Context) {
	idParam := c.Param("voting_id")
	id64, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "id inválido", Error: "Debe ser numérico"})
		return
	}
	options, err := h.votingUseCase.ListVotingOptionsByVoting(c.Request.Context(), uint(id64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error listando opciones", Error: err.Error()})
		return
	}

	// Mapear DTOs a responses
	responseData := mapper.MapVotingOptionDTOsToResponses(options)
	c.JSON(http.StatusOK, response.VotingOptionsSuccess{Success: true, Message: "Opciones obtenidas", Data: responseData})
}
