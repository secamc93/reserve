package handlerpublic

import (
	"net/http"
	"strconv"
	"strings"

	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/response"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/votingstream"
	sharedjwt "central_reserve/shared/jwt"

	"github.com/gin-gonic/gin"
)

// PublicSSEVotingResults godoc
//
//	@Summary		Stream público de resultados de votación en tiempo real (SSE)
//	@Description	Stream SSE con los resultados de una votación. Acepta el token de votación del residente (el que devuelve /public/validate-resident) por ?token= o header Authorization. Con token de GRUPO se debe indicar ?voting_id= (la votación debe pertenecer al grupo del token); con token de votación individual voting_id es opcional y debe coincidir. Eventos: connected, initial_data, new_vote, vote_deleted, votes_reset, heartbeat. El data de cada evento de resultados es {voting_id, total_votes, results[]} (results con vote_count, percentage y percentage_by_coefficient); el stream público no incluye votos individuales.
//	@Tags			Votaciones Públicas
//	@Produce		text/event-stream
//	@Param			token			query	string	false	"Token de votación del residente (alternativa al header)"
//	@Param			voting_id		query	int		false	"ID de la votación (obligatorio con token de grupo)"
//	@Param			Authorization	header	string	false	"Token de votación del residente (Bearer token)"
//	@Success		200				{string}	string	"Event stream"
//	@Failure		400				{object}	response.ErrorResponse
//	@Failure		401				{object}	response.ErrorResponse
//	@Failure		404				{object}	response.ErrorResponse
//	@Router			/public/voting-stream [get]
func (h *PublicHandler) PublicSSEVotingResults(c *gin.Context) {
	// EventSource no permite headers: se acepta ?token= y, como alternativa, Authorization.
	tokenString := c.Query("token")
	if tokenString == "" {
		tokenString = strings.TrimPrefix(c.GetHeader("Authorization"), "Bearer ")
	}
	if tokenString == "" {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "Token de autenticación requerido",
			Error:   "Debe proporcionar el token como query param (?token=...) o en header Authorization",
		})
		return
	}

	claims, err := sharedjwt.New(h.jwtSecret).ValidateVotingAuthToken(tokenString)
	if err != nil {
		h.logger.Warn().Err(err).Msg("Token de votación inválido en stream público")
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "Token de autenticación inválido",
			Error:   err.Error(),
		})
		return
	}

	var queryVotingID uint
	if q := c.Query("voting_id"); q != "" {
		id, err := strconv.ParseUint(q, 10, 32)
		if err != nil || id == 0 {
			c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "voting_id inválido", Error: "Debe ser numérico y > 0"})
			return
		}
		queryVotingID = uint(id)
	}

	var votingID uint
	if claims.VotingID == nil {
		// Token de grupo: la votación viene por query y debe ser del grupo del token.
		if queryVotingID == 0 {
			c.JSON(http.StatusBadRequest, response.ErrorResponse{
				Success: false,
				Message: "voting_id requerido",
				Error:   "Con un token de grupo se debe indicar ?voting_id=",
			})
			return
		}
		votingID = queryVotingID
	} else {
		votingID = *claims.VotingID
		if queryVotingID != 0 && queryVotingID != votingID {
			c.JSON(http.StatusBadRequest, response.ErrorResponse{
				Success: false,
				Message: "voting_id inválido",
				Error:   "El voting_id debe coincidir con el del token",
			})
			return
		}
	}

	if _, err := h.votingsUseCase.GetVotingByID(c.Request.Context(), claims.HPID, claims.VotingGroupID, votingID); err != nil {
		c.JSON(http.StatusNotFound, response.ErrorResponse{
			Success: false,
			Message: "Votación no encontrada",
			Error:   "La votación no existe o no pertenece al grupo del token",
		})
		return
	}

	h.logger.Info().Uint("voting_id", votingID).Uint("property_unit_id", claims.PropertyUnitID).Msg("Cliente SSE público conectado")
	votingstream.Serve(c, votingstream.Options{
		VotingID:     votingID,
		IncludeVotes: false,
		Connected: gin.H{
			"voting_group_id":  claims.VotingGroupID,
			"property_unit_id": claims.PropertyUnitID,
		},
	}, h.votesUseCase, h.resultsUseCase, h.votingCache, h.logger)
}
