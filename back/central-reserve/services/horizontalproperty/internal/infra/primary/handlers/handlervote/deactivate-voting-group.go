package handlervote

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/response"

	"github.com/gin-gonic/gin"
)

// DeleteVotingGroup godoc
//
//	@Summary		Eliminar un grupo de votación
//	@Description	Elimina permanentemente un grupo de votación y todos sus registros asociados
//	@Tags			Votaciones
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			group_id	path	int	true	"ID del grupo de votación"
//	@Success		200		{object}	object
//	@Failure		400		{object}	object
//	@Failure		404		{object}	object
//	@Failure		500		{object}	object
//	@Router			/horizontal-properties/voting-groups/{group_id} [delete]
func (h *VotingHandler) DeleteVotingGroup(c *gin.Context) {
	idParam := c.Param("group_id")
	id64, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/delete-voting-group.go - Error en handler: %v\n", err)
		h.logger.Error().Err(err).Str("group_id", idParam).Msg("Error parseando ID de grupo de votación")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "id inválido", Error: "Debe ser numérico"})
		return
	}

	ctx := c.Request.Context()
	votings, err := h.votingRepository.ListVotingsByGroup(ctx, uint(id64))
	if err != nil {
		h.logger.Error().Err(err).Uint("group_id", uint(id64)).Msg("Error obteniendo votaciones del grupo antes de eliminar")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "No se pudo preparar la eliminación", Error: err.Error()})
		return
	}

	if err := h.votingUseCase.DeleteVotingGroup(ctx, uint(id64)); err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/delete-voting-group.go - Error en handler: %v\n", err)
		h.logger.Error().Err(err).Uint("group_id", uint(id64)).Msg("Error eliminando grupo de votación")
		status := http.StatusInternalServerError
		if strings.Contains(strings.ToLower(err.Error()), "no encontrado") {
			status = http.StatusNotFound
		}
		c.JSON(status, response.ErrorResponse{Success: false, Message: "No se pudo eliminar", Error: err.Error()})
		return
	}

	for _, voting := range votings {
		h.votingCache.ClearVoting(voting.ID)
	}

	h.logger.Info().Uint("group_id", uint(id64)).Msg("Grupo de votación eliminado permanentemente")

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Grupo eliminado permanentemente"})
}
