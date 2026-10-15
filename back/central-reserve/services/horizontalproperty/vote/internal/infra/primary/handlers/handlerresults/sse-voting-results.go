package handlerresults

import (
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/response"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/votingstream"

	"github.com/gin-gonic/gin"
)

// SSEVotingResults godoc
//
//	@Summary		Stream de resultados de votación en tiempo real (SSE)
//	@Description	Stream SSE de una votación para el admin. Requiere el business token en el header Authorization. La votación debe ser del grupo de la ruta y el grupo del negocio del token (super admin: ?business_id= opcional). Eventos: connected, initial_data ({voting_id, total_votes, results[], votes[]}), new_vote y vote_deleted ({voting_id, total_votes, results[], vote}), votes_reset ({voting_id, total_votes, results[]}), heartbeat.
//	@Tags			Votaciones
//	@Produce		text/event-stream
//	@Security		BearerAuth
//	@Param			group_id	path		int		true	"ID del grupo de votación"
//	@Param			voting_id	path		int		true	"ID de la votación"
//	@Param			business_id	query		int		false	"ID del negocio (solo super admin, opcional)"
//	@Success		200			{string}	string	"Event stream"
//	@Failure		400			{object}	response.ErrorResponse
//	@Failure		401			{object}	response.ErrorResponse
//	@Failure		404			{object}	response.ErrorResponse
//	@Router			/horizontal-properties/voting-groups/{group_id}/votings/{voting_id}/stream [get]
func (h *ResultsHandler) SSEVotingResults(c *gin.Context) {
	groupID, errG := strconv.ParseUint(c.Param("group_id"), 10, 32)
	votingID, errV := strconv.ParseUint(c.Param("voting_id"), 10, 32)
	if errG != nil || errV != nil || groupID == 0 || votingID == 0 {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "IDs inválidos", Error: "group_id y voting_id deben ser numéricos"})
		return
	}

	// Aislamiento multi-tenant: el grupo debe ser del negocio del token. El super admin puede
	// acotar con ?business_id=; si no lo envía, no se restringe.
	var businessID uint
	if middleware.IsSuperAdmin(c) {
		if q := c.Query("business_id"); q != "" {
			id, err := strconv.ParseUint(q, 10, 32)
			if err != nil || id == 0 {
				c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "business_id inválido", Error: "Debe ser numérico y > 0"})
				return
			}
			businessID = uint(id)
		}
	} else {
		bid, ok := middleware.GetBusinessID(c)
		if !ok || bid == 0 {
			c.JSON(http.StatusUnauthorized, response.ErrorResponse{Success: false, Message: "token inválido", Error: "business_id no encontrado"})
			return
		}
		businessID = bid
	}

	notFound := func() {
		c.JSON(http.StatusNotFound, response.ErrorResponse{Success: false, Message: "Votación no encontrada", Error: "La votación no existe o no pertenece a este grupo/negocio"})
	}
	group, err := h.groupsUseCase.GetVotingGroupByID(c.Request.Context(), uint(groupID))
	if err != nil || group == nil || (businessID != 0 && group.BusinessID != businessID) {
		notFound()
		return
	}
	if _, err := h.votingsUseCase.GetVotingByID(c.Request.Context(), group.BusinessID, group.ID, uint(votingID)); err != nil {
		notFound()
		return
	}

	h.logger.Info().Uint("voting_id", uint(votingID)).Msg("Cliente admin conectado al SSE de votación")
	votingstream.Serve(c, votingstream.Options{
		VotingID:     uint(votingID),
		IncludeVotes: true,
		Connected:    gin.H{"voting_group_id": group.ID},
	}, h.votesUseCase, h.resultsUseCase, h.votingCache, h.logger)
}
