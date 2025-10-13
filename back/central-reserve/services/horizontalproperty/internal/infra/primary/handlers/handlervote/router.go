package handlervote

import (
	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

func (h *VotingHandler) RegisterRoutes(router *gin.RouterGroup) {
	// Rutas privadas (requieren autenticación admin)
	groups := router.Group("/horizontal-properties/:hp_id/voting-groups")
	{
		groups.POST("", middleware.JWT(), h.CreateVotingGroup)
		groups.GET("", middleware.JWT(), h.ListVotingGroups)
		groups.PUT("/:group_id", middleware.JWT(), h.UpdateVotingGroup)
		groups.DELETE("/:group_id", middleware.JWT(), h.DeactivateVotingGroup)

		votings := groups.Group("/:group_id/votings")
		{
			votings.POST("", middleware.JWT(), h.CreateVoting)
			votings.GET("", middleware.JWT(), h.ListVotings)
			votings.PUT("/:voting_id", middleware.JWT(), h.UpdateVoting)
			votings.DELETE("/:voting_id", middleware.JWT(), h.DeactivateVoting)
			votings.GET("/:voting_id/stream", middleware.JWT(), h.SSEVotingResults)                      // SSE en tiempo real
			votings.POST("/:voting_id/generate-public-url", middleware.JWT(), h.GeneratePublicVotingURL) // Generar URL pública

			options := votings.Group("/:voting_id/options")
			{
				options.POST("", middleware.JWT(), h.CreateVotingOption)
				options.GET("", middleware.JWT(), h.ListVotingOptions)
				options.DELETE("/:option_id", middleware.JWT(), h.DeactivateVotingOption)
			}

			votes := votings.Group("/:voting_id/votes")
			{
				votes.POST("", middleware.JWT(), h.CreateVote)
				votes.GET("", middleware.JWT(), h.ListVotes)
			}
		}
	}

	// Rutas públicas (sin autenticación admin, usan token de votación pública)
	// NO requieren hp_id en path porque viene en el token
	publicRoutes := router.Group("/public")
	{
		// Con PUBLIC_VOTING_TOKEN
		publicRoutes.GET("/voting-context", h.GetPublicVotingContext)
		publicRoutes.GET("/property-units", h.GetPublicPropertyUnits)
		publicRoutes.POST("/validate-resident", h.ValidateResidentForVoting)

		// Con VOTING_AUTH_TOKEN (después de validar residente)
		publicRoutes.GET("/voting-info", h.GetPublicVotingInfo)
		publicRoutes.GET("/units-with-residents", h.GetPublicUnitsWithResidents)
		publicRoutes.GET("/votes", h.GetPublicVotes)
		publicRoutes.GET("/voting-stream", h.PublicSSEVotingResults)
	}
}
