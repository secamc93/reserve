package handlervote

import (
	"fmt"
	"net/http"
	"os"
	"strconv"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/response"

	"github.com/gin-gonic/gin"
)

// DeleteVoting godoc
//
//	@Summary		Eliminar una votación
//	@Description	Elimina permanentemente una votación usando soft delete (gorm.DeletedAt)
//	@Tags			Votaciones
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			hp_id		path		int	true	"ID de la propiedad horizontal"
//	@Param			group_id	path		int	true	"ID del grupo de votación"
//	@Param			voting_id	path		int	true	"ID de la votación"
//	@Success		200			{object}	object
//	@Failure		400			{object}	object
//	@Failure		404			{object}	object
//	@Failure		500			{object}	object
//	@Router			/horizontal-properties/{hp_id}/voting-groups/{group_id}/votings/{voting_id} [delete]
func (h *VotingHandler) DeleteVoting(c *gin.Context) {
	idParam := c.Param("voting_id")
	id64, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/delete-voting.go - Error en handler: %v\n", err)
		h.logger.Error().Err(err).Str("voting_id", idParam).Msg("Error parseando ID de votación")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "id inválido", Error: "Debe ser numérico"})
		return
	}
	if err := h.votingUseCase.DeleteVoting(c.Request.Context(), uint(id64)); err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/delete-voting.go - Error en handler: %v\n", err)
		h.logger.Error().Err(err).Uint("voting_id", uint(id64)).Msg("Error eliminando votación")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "No se pudo eliminar", Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Votación eliminada"})
}
