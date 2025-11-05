package handlervote

import (
	"net/http"
	"strconv"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// ListVotings godoc
//
//	@Summary		Listar votaciones de un grupo
//	@Description	Obtiene la lista de votaciones de un grupo de votación específico
//	@Tags			Votaciones
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			group_id	path		int	true	"ID del grupo de votación"
//	@Param			group_id	query		int	false	"Alternativa: enviar como query si no va en el path"
//	@Success		200			{object}	object
//	@Failure		400			{object}	object
//	@Failure		500			{object}	object
//	@Router			/horizontal-properties/voting-groups/{group_id}/votings [get]
func (h *VotingHandler) ListVotings(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "ListVotings")

	// Obtener group_id desde path o query
	idParam := c.Param("group_id")
	if idParam == "" {
		idParam = c.Query("group_id")
	}
	id64, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil || id64 == 0 {
		h.logger.Error(ctx).Str("group_id", idParam).Msg("ID de grupo inválido")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "ID inválido", Error: "El ID debe ser un número válido"})
		return
	}
	votings, err := h.votingUseCase.ListVotingsByGroup(ctx, uint(id64))
	if err != nil {
		h.logger.Error(ctx).Err(err).Uint("group_id", uint(id64)).Msg("Error listando votaciones")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error listando votaciones", Error: err.Error()})
		return
	}

	// Mapear DTOs a responses
	responseData := mapper.MapVotingDTOsToResponses(votings)
	c.JSON(http.StatusOK, response.VotingsSuccess{Success: true, Message: "Votaciones obtenidas", Data: responseData})
}
