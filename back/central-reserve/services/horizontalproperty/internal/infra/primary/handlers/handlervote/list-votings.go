package handlervote

import (
	"net/http"
	"strconv"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/response"

	"github.com/gin-gonic/gin"
)

// ListVotings godoc
// @Summary Listar votaciones de un grupo
// @Description Obtiene la lista de votaciones de un grupo de votación específico
// @Tags Votaciones
// @Accept json
// @Produce json
// @Param hp_id path int true "ID de la propiedad horizontal"
// @Param group_id path int true "ID del grupo de votación"
// @Success 200 {object} object
// @Failure 400 {object} object
// @Failure 500 {object} object
// @Router /horizontal-properties/{hp_id}/voting-groups/{group_id}/votings [get]
func (h *VotingHandler) ListVotings(c *gin.Context) {
	idParam := c.Param("group_id")
	id64, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "id inválido", Error: "Debe ser numérico"})
		return
	}
	votings, err := h.votingUseCase.ListVotingsByGroup(c.Request.Context(), uint(id64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error listando votaciones", Error: err.Error()})
		return
	}

	// Mapear DTOs a responses
	responseData := mapper.MapVotingDTOsToResponses(votings)
	c.JSON(http.StatusOK, response.VotingsSuccess{Success: true, Message: "Votaciones obtenidas", Data: responseData})
}
