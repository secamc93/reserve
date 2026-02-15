package handlervotes

import (
	"fmt"
	"net/http"
	"os"
	"strconv"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// CreateVote godoc
//
//	@Summary		Registrar un voto
//	@Description	Registra el voto de un residente para una votación específica
//	@Tags			Votaciones
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			group_id	path		int							true	"ID del grupo de votación"
//	@Param			voting_id	path		int							true	"ID de la votación"
//	@Param			vote		body		request.CreateVoteRequest	true	"Datos del voto"
//	@Success		201			{object}	object
//	@Failure		400			{object}	object
//	@Failure		500			{object}	object
//	@Router			/horizontal-properties/voting-groups/{group_id}/votings/{voting_id}/votes [post]
func (h *VotesHandler) CreateVote(c *gin.Context) {
	idParam := c.Param("voting_id")
	id64, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		fmt.Printf("[ERROR] CreateVote - Error parseando ID de votación: voting_id=%s, error=%v\n", idParam, err)
		h.logger.Error().Err(err).Str("voting_id", idParam).Msg("Error parseando ID de votación")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "id inválido", Error: "Debe ser numérico"})
		return
	}
	var req request.CreateVoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Printf("[ERROR] CreateVote - Error validando datos del request: voting_id=%d, error=%v\n", uint(id64), err)
		h.logger.Error().Err(err).Uint("voting_id", uint(id64)).Msg("Error validando datos del request")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Datos inválidos", Error: err.Error()})
		return
	}
	fmt.Printf("\n🗳️  [VOTACION PUBLICA - REGISTRANDO VOTO]\n")
	fmt.Printf("   Votación ID: %d\n", uint(id64))
	fmt.Printf("   Unidad ID: %d\n", req.PropertyUnitID)
	fmt.Printf("   Opción seleccionada ID: %d\n", req.VotingOptionID)
	fmt.Printf("   IP: %s\n", req.IPAddress)
	fmt.Printf("   User Agent: %s\n\n", req.UserAgent)

	dto := domain.CreateVoteDTO{
		VotingID:       uint(id64),
		PropertyUnitID: req.PropertyUnitID,
		VotingOptionID: req.VotingOptionID,
		IPAddress:      req.IPAddress,
		UserAgent:      req.UserAgent,
	}
	created, err := h.votingUseCase.CreateVote(c.Request.Context(), dto)
	if err != nil {
		fmt.Printf("[ERROR] CreateVote - Error registrando voto: voting_id=%d, property_unit_id=%d, option_id=%d, error=%v\n",
			uint(id64), req.PropertyUnitID, req.VotingOptionID, err)
		fmt.Fprintf(os.Stderr, "[ERROR] handlers/create-vote.go - Error en handler: %v\n", err)
		h.logger.Error().Err(err).Uint("voting_id", uint(id64)).Uint("property_unit_id", req.PropertyUnitID).Uint("option_id", req.VotingOptionID).Msg("Error registrando voto")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "No se pudo registrar el voto", Error: err.Error()})
		return
	}

	fmt.Printf("✅ [VOTACION PUBLICA - VOTO REGISTRADO]\n")
	fmt.Printf("   Voto ID: %d\n", created.ID)
	fmt.Printf("   Votación ID: %d\n", created.VotingID)
	fmt.Printf("   Unidad ID: %d\n", created.PropertyUnitID)
	fmt.Printf("   Opción ID: %d\n", created.VotingOptionID)
	fmt.Printf("   Fecha: %s\n\n", created.VotedAt)

	h.logger.Info().
		Uint("vote_id", created.ID).
		Uint("voting_id", created.VotingID).
		Uint("property_unit_id", created.PropertyUnitID).
		Uint("option_id", created.VotingOptionID).
		Msg("✅ [VOTACION PUBLICA] Voto registrado exitosamente")

	// Mapear DTO a response
	responseData := mappers.MapVoteDTOToResponse(created)
	c.JSON(http.StatusCreated, response.VoteSuccess{Success: true, Message: "Voto registrado", Data: responseData})
}
