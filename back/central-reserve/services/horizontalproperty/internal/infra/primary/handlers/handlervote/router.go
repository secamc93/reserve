package handlervote

import "github.com/gin-gonic/gin"

func (h *VotingHandler) RegisterRoutes(router *gin.RouterGroup) {
	groups := router.Group("/horizontal-properties/:hp_id/voting-groups")
	{
		groups.POST("", h.CreateVotingGroup)
		groups.GET("", h.ListVotingGroups)
		groups.PUT("/:group_id", h.UpdateVotingGroup)
		groups.DELETE("/:group_id", h.DeactivateVotingGroup)

		votings := groups.Group("/:group_id/votings")
		{
			votings.POST("", h.CreateVoting)
			votings.GET("", h.ListVotings)
			votings.PUT("/:voting_id", h.UpdateVoting)
			votings.DELETE("/:voting_id", h.DeactivateVoting)

			options := votings.Group("/:voting_id/options")
			{
				options.POST("", h.CreateVotingOption)
				options.GET("", h.ListVotingOptions)
				options.DELETE("/:option_id", h.DeactivateVotingOption)
			}

			votes := votings.Group("/:voting_id/votes")
			{
				votes.POST("", h.CreateVote)
			}
		}
	}
}
