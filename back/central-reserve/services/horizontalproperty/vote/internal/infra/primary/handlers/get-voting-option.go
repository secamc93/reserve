package handlers

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"

	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/mapper"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// GetVotingOptionByID godoc
//
//	@Summary	Obtener opción de votación
//	@Description	Obtiene una opción de votación por su ID
//	@Tags		Votaciones
//	@Security	BearerAuth
//	@Accept		json
//	@Produce	json
//	@Param		group_id	path	int	true	"ID del grupo de votación"
//	@Param		voting_id	path	int	true	"ID de la votación"
//	@Param		option_id	path	int	true	"ID de la opción de votación"
//	@Success	200	{object}	object
//	@Failure	400	{object}	object
//	@Failure	404	{object}	object
//	@Failure	500	{object}	object
//	@Router		/horizontal-properties/voting-groups/{group_id}/votings/{voting_id}/options/{option_id} [get]
func (h *VotingHandler) GetVotingOptionByID(c *gin.Context) {
	idParam := c.Param("option_id")
	id64, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlers/get-voting-option.go - Error en handler: %v\n", err)
		h.logger.Error().Err(err).Str("option_id", idParam).Msg("Error parseando ID de opción de votación")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "id inválido", Error: "Debe ser numérico"})
		return
	}

	option, err := h.votingUseCase.GetVotingOptionByID(c.Request.Context(), uint(id64))
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlers/get-voting-option.go - Error en handler: %v\n", err)
		h.logger.Error().Err(err).Uint("option_id", uint(id64)).Msg("Error obteniendo opción de votación")

		status := http.StatusInternalServerError
		if strings.Contains(err.Error(), "no encontrada") {
			status = http.StatusNotFound
		}

		c.JSON(status, response.ErrorResponse{Success: false, Message: "No se pudo obtener la opción", Error: err.Error()})
		return
	}

	responseData := mapper.MapVotingOptionDTOToResponse(option)
	c.JSON(http.StatusOK, response.VotingOptionSuccess{Success: true, Message: "Opción obtenida", Data: responseData})
}
