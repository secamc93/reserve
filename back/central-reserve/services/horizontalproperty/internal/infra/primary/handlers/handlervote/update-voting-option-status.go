package handlervote

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/request"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/response"

	"github.com/gin-gonic/gin"
)

// UpdateVotingOptionStatus godoc
//
//	@Summary	Actualizar estado de una opción de votación
//	@Description	Activa o desactiva una opción de votación existente
//	@Tags		Votaciones
//	@Security	BearerAuth
//	@Accept		json
//	@Produce	json
//	@Param		group_id	path	int	true	"ID del grupo de votación"
//	@Param		voting_id	path	int	true	"ID de la votación"
//	@Param		option_id	path	int	true	"ID de la opción de votación"
//	@Param		body	body	request.UpdateVotingOptionStatusRequest	true	"Estado a aplicar"
//	@Success	200	{object}	object
//	@Failure	400	{object}	object
//	@Failure	404	{object}	object
//	@Failure	500	{object}	object
//	@Router		/horizontal-properties/voting-groups/{group_id}/votings/{voting_id}/options/{option_id}/status [patch]
func (h *VotingHandler) UpdateVotingOptionStatus(c *gin.Context) {
	idParam := c.Param("option_id")
	id64, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/update-voting-option-status.go - Error en handler: %v\n", err)
		h.logger.Error().Err(err).Str("option_id", idParam).Msg("Error parseando ID de opción de votación")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "id inválido", Error: "Debe ser numérico"})
		return
	}

	var reqBody request.UpdateVotingOptionStatusRequest
	if err := c.ShouldBindJSON(&reqBody); err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/update-voting-option-status.go - Error en handler: %v\n", err)
		h.logger.Error().Err(err).Uint("option_id", uint(id64)).Msg("Error validando datos del request")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Datos inválidos", Error: err.Error()})
		return
	}

	opcion, err := h.votingUseCase.UpdateVotingOptionStatus(c.Request.Context(), uint(id64), *reqBody.IsActive)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/update-voting-option-status.go - Error en handler: %v\n", err)
		h.logger.Error().Err(err).Uint("option_id", uint(id64)).Msg("Error actualizando estado de opción")
		status := http.StatusInternalServerError
		if strings.Contains(err.Error(), "no encontrada") {
			status = http.StatusNotFound
		}
		c.JSON(status, response.ErrorResponse{Success: false, Message: "No se pudo actualizar", Error: err.Error()})
		return
	}

	responseData := mapper.MapVotingOptionDTOToResponse(opcion)
	c.JSON(http.StatusOK, response.VotingOptionSuccess{Success: true, Message: "Estado actualizado", Data: responseData})
}
