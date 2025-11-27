package handlervotinggroups

import (
	"fmt"
	"net/http"
	"os"
	"strconv"

	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// DeactivateVotingGroup godoc
//
//	@Summary		Desactivar un grupo de votación
//	@Description	Desactiva un grupo de votación sin eliminarlo
//	@Tags			Votaciones
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			group_id	path	int	true	"ID del grupo de votación"
//	@Success		200			{object}	object
//	@Failure		400			{object}	object
//	@Failure		404			{object}	object
//	@Failure		500			{object}	object
//	@Router			/horizontal-properties/voting-groups/{group_id}/deactivate [patch]
func (h *VotingGroupsHandler) DeactivateVotingGroup(c *gin.Context) {
	idParam := c.Param("group_id")
	id64, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlers/deactivate-voting-group.go - Error en handler: %v\n", err)
		h.logger.Error().Err(err).Str("group_id", idParam).Msg("Error parseando ID de grupo de votación")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "id inválido", Error: "Debe ser numérico"})
		return
	}

	ctx := c.Request.Context()

	if err := h.votingUseCase.DeactivateVotingGroup(ctx, uint(id64)); err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlers/deactivate-voting-group.go - Error en handler: %v\n", err)
		h.logger.Error().Err(err).Uint("group_id", uint(id64)).Msg("Error desactivando grupo de votación")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "No se pudo desactivar", Error: err.Error()})
		return
	}

	h.logger.Info().Uint("group_id", uint(id64)).Msg("Grupo de votación desactivado")

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Grupo desactivado exitosamente"})
}
