package handlervote

import (
	"net/http"
	"strconv"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/response"

	"github.com/gin-gonic/gin"
)

// DeactivateVotingGroup godoc
// @Summary Desactivar un grupo de votación
// @Description Desactiva un grupo de votación existente
// @Tags Votaciones
// @Accept json
// @Produce json
// @Param hp_id path int true "ID de la propiedad horizontal"
// @Param group_id path int true "ID del grupo de votación"
// @Success 200 {object} object
// @Failure 400 {object} object
// @Failure 404 {object} object
// @Failure 500 {object} object
// @Router /horizontal-properties/{hp_id}/voting-groups/{group_id} [delete]
func (h *VotingHandler) DeactivateVotingGroup(c *gin.Context) {
	idParam := c.Param("group_id")
	id64, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "id inválido", Error: "Debe ser numérico"})
		return
	}
	if err := h.votingUseCase.DeactivateVotingGroup(c.Request.Context(), uint(id64)); err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "No se pudo desactivar", Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Grupo desactivado"})
}
