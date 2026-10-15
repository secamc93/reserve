package handlers

import (
	"context"
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/vote/internal/domain"

	"github.com/gin-gonic/gin"
)

// GroupLookup y VotingLookup son lo único que el guard necesita de los casos de uso.
type GroupLookup interface {
	GetVotingGroupByID(ctx context.Context, id uint) (*domain.VotingGroupDTO, error)
}

type VotingLookup interface {
	GetVotingByID(ctx context.Context, hpID, groupID, votingID uint) (*domain.VotingDTO, error)
}

// ScopeGuard verifica, en toda ruta con :group_id, que el grupo sea de la propiedad del token
// (o de ?business_id para el super admin) y, si hay :voting_id, que la votación sea de ese grupo.
// Si no, responde 404 (no revela que el recurso existe en otra propiedad).
// Debe ir después de middleware.JWT() en la cadena.
func ScopeGuard(groups GroupLookup, votings VotingLookup) gin.HandlerFunc {
	return func(c *gin.Context) {
		rawGroup := c.Param("group_id")
		if rawGroup == "" {
			c.Next()
			return
		}
		notFound := func() {
			c.AbortWithStatusJSON(http.StatusNotFound, gin.H{"success": false, "message": "Grupo de votación no encontrado", "error": "not_found"})
		}

		groupID, err := strconv.ParseUint(rawGroup, 10, 32)
		if err != nil || groupID == 0 {
			notFound()
			return
		}
		group, err := groups.GetVotingGroupByID(c.Request.Context(), uint(groupID))
		if err != nil || group == nil {
			notFound()
			return
		}

		if middleware.IsSuperAdmin(c) {
			if q := c.Query("business_id"); q != "" {
				bid, err := strconv.ParseUint(q, 10, 32)
				if err != nil || uint(bid) != group.BusinessID {
					notFound()
					return
				}
			}
		} else {
			bid, ok := middleware.GetBusinessID(c)
			if !ok || bid == 0 || bid != group.BusinessID {
				notFound()
				return
			}
		}

		if rawVoting := c.Param("voting_id"); rawVoting != "" {
			votingID, err := strconv.ParseUint(rawVoting, 10, 32)
			if err != nil || votingID == 0 {
				notFound()
				return
			}
			if _, err := votings.GetVotingByID(c.Request.Context(), group.BusinessID, uint(groupID), uint(votingID)); err != nil {
				notFound()
				return
			}
		}
		c.Next()
	}
}
