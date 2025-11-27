package usecasevotinggroups

import (
	"context"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/shared/log"
)

func (u *VotingGroupUseCase) ListVotingGroupsByBusiness(ctx context.Context, businessID uint) ([]domain.VotingGroupDTO, error) {
	// Configurar contexto de logging
	ctx = log.WithFunctionCtx(ctx, "ListVotingGroupsByBusiness")
	ctx = log.WithBusinessIDCtx(ctx, businessID)

	groups, err := u.repo.ListVotingGroupsByBusiness(ctx, businessID)
	if err != nil {
		u.logger.Error(ctx).Err(err).Msg("Error listando grupos de votación desde repositorio")
		return nil, err
	}
	res := make([]domain.VotingGroupDTO, len(groups))
	for i := range groups {
		g := groups[i]
		res[i] = domain.VotingGroupDTO{
			ID:               g.ID,
			BusinessID:       g.BusinessID,
			Name:             g.Name,
			Description:      g.Description,
			VotingStartDate:  g.VotingStartDate,
			VotingEndDate:    g.VotingEndDate,
			IsActive:         g.IsActive,
			RequiresQuorum:   g.RequiresQuorum,
			QuorumPercentage: g.QuorumPercentage,
			CreatedByUserID:  g.CreatedByUserID,
			Notes:            g.Notes,
			CreatedAt:        g.CreatedAt,
			UpdatedAt:        g.UpdatedAt,
		}
	}
	return res, nil
}
