package handlerpublic

import (
	"github.com/gin-gonic/gin"
)

// Router registra las rutas del módulo handler-public sobre el grupo recibido.
func (h *PublicHandler) Router(group *gin.RouterGroup) {
	// Con PUBLIC_VOTING_TOKEN
	group.GET("/voting-context", h.GetPublicVotingContext)
	group.GET("/property-units", h.GetPublicPropertyUnits)
	group.POST("/validate-resident", h.ValidateResidentForVoting)

	// Con VOTING_AUTH_TOKEN (después de validar residente)
	group.GET("/voting-info", h.GetPublicVotingInfo)
	group.POST("/vote", h.CreatePublicVote)
	group.GET("/units-with-residents", h.GetPublicUnitsWithResidents)
	group.GET("/votes", h.GetPublicVotes)
	group.GET("/voting-stream", h.PublicSSEVotingResults)
}
