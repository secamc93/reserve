package usecasevote

import (
	"context"

	"central_reserve/services/horizontalproperty/internal/domain"
)

// GetVotingGroupByID obtiene un grupo de votación por su ID
func (uc *votingUseCase) GetVotingGroupByID(ctx context.Context, id uint) (*domain.VotingGroupDTO, error) {
	group, err := uc.repo.GetVotingGroupByID(ctx, id)
	if err != nil {
		uc.logger.Error().Err(err).Uint("group_id", id).Msg("Error obteniendo grupo de votación")
		return nil, err
	}

	return &domain.VotingGroupDTO{
		ID:               group.ID,
		BusinessID:       group.BusinessID,
		Name:             group.Name,
		Description:      group.Description,
		VotingStartDate:  group.VotingStartDate,
		VotingEndDate:    group.VotingEndDate,
		IsActive:         group.IsActive,
		RequiresQuorum:   group.RequiresQuorum,
		QuorumPercentage: group.QuorumPercentage,
		CreatedByUserID:  group.CreatedByUserID,
		Notes:            group.Notes,
		CreatedAt:        group.CreatedAt,
		UpdatedAt:        group.UpdatedAt,
	}, nil
}
