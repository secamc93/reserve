package handlervote

import (
	"net/http"
	"strconv"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/response"

	"github.com/gin-gonic/gin"
)

// ListVotingGroups godoc
// @Summary Listar grupos de votación
// @Description Obtiene la lista de grupos de votación de una propiedad horizontal
// @Tags Votaciones
// @Accept json
// @Produce json
// @Param hp_id path int true "ID de la propiedad horizontal"
// @Success 200 {object} object
// @Failure 400 {object} object
// @Failure 500 {object} object
// @Router /horizontal-properties/{hp_id}/voting-groups [get]
func (h *VotingHandler) ListVotingGroups(c *gin.Context) {
	idParam := c.Param("hp_id")
	id64, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "id inválido", Error: "Debe ser numérico"})
		return
	}

	groups, err := h.votingUseCase.ListVotingGroupsByBusiness(c.Request.Context(), uint(id64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error listando grupos", Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, response.VotingGroupsSuccess{Success: true, Message: "Grupos obtenidos", Data: groups})
}
