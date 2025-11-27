package handlers

import (
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/handlerpublic"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/handlerresults"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/handlervotes"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/handlervotinggroups"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/handlervotingoptions"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/handlervotings"

	"github.com/gin-gonic/gin"
)

// VotingHandler orquesta todos los handlers modulares
type VotingHandler struct {
	votingGroupsHandler  handlervotinggroups.IVotingGroupsHandler
	votingsHandler       handlervotings.IVotingsHandler
	resultsHandler       handlerresults.IResultsHandler
	votingOptionsHandler handlervotingoptions.IVotingOptionsHandler
	votesHandler         handlervotes.IVotesHandler
	publicHandler        handlerpublic.IPublicHandler
}

// New crea el handler principal que orquesta todos los handlers modulares
func New(
	votingGroupsHandler handlervotinggroups.IVotingGroupsHandler,
	votingsHandler handlervotings.IVotingsHandler,
	resultsHandler handlerresults.IResultsHandler,
	votingOptionsHandler handlervotingoptions.IVotingOptionsHandler,
	votesHandler handlervotes.IVotesHandler,
	publicHandler handlerpublic.IPublicHandler,
) *VotingHandler {
	return &VotingHandler{
		votingGroupsHandler:  votingGroupsHandler,
		votingsHandler:       votingsHandler,
		resultsHandler:       resultsHandler,
		votingOptionsHandler: votingOptionsHandler,
		votesHandler:         votesHandler,
		publicHandler:        publicHandler,
	}
}

// RegisterRoutes es el router general que orquesta todos los handlers modulares.
// Mantiene exactamente las mismas URLs que existían antes.
func (h *VotingHandler) RegisterRoutes(router *gin.RouterGroup) {
	// Rutas privadas (requieren autenticación admin)
	groups := router.Group("/horizontal-properties/voting-groups")
	{
		// handler-voting-groups: /horizontal-properties/voting-groups
		h.votingGroupsHandler.Router(groups)

		// handler-votings: /horizontal-properties/voting-groups/:group_id/votings
		votings := groups.Group("/:group_id/votings")
		h.votingsHandler.Router(votings)

		// handler-results: /horizontal-properties/voting-groups/:group_id/votings/:voting_id/{stream,voting-details,unvoted-units}
		h.resultsHandler.Router(votings)

		// handler-voting-options: /horizontal-properties/voting-groups/:group_id/votings/:voting_id/options
		options := votings.Group("/:voting_id/options")
		h.votingOptionsHandler.Router(options)

		// handler-votes: /horizontal-properties/voting-groups/:group_id/votings/:voting_id/votes
		votes := votings.Group("/:voting_id/votes")
		h.votesHandler.Router(votes)
	}

	// Rutas públicas (sin autenticación admin, usan token de votación pública)
	publicRoutes := router.Group("/public")
	{
		// handler-public
		h.publicHandler.Router(publicRoutes)
	}
}
