package usecasevotinggroups

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/shared/log"
)

func (u *VotingGroupUseCase) UpdateVotingGroup(ctx context.Context, id uint, dto domain.CreateVotingGroupDTO) (*domain.VotingGroupDTO, error) {
	// Configurar contexto de logging
	ctx = log.WithFunctionCtx(ctx, "UpdateVotingGroup")

	if dto.RequiresQuorum && dto.QuorumPercentage == nil {
		u.logger.Error(ctx).Uint("group_id", id).Msg("Quorum requerido pero no se especificó quorum_percentage")
		return nil, fmt.Errorf("debe especificar quorum_percentage")
	}
	entity := &domain.VotingGroup{
		Name:             dto.Name,
		Description:      dto.Description,
		VotingStartDate:  dto.VotingStartDate,
		VotingEndDate:    dto.VotingEndDate,
		RequiresQuorum:   dto.RequiresQuorum,
		QuorumPercentage: dto.QuorumPercentage,
		Notes:            dto.Notes,
	}
	updated, err := u.repo.UpdateVotingGroup(ctx, id, entity)
	if err != nil {
		return nil, err
	}
	return &domain.VotingGroupDTO{
		ID:               updated.ID,
		BusinessID:       updated.BusinessID,
		Name:             updated.Name,
		Description:      updated.Description,
		VotingStartDate:  updated.VotingStartDate,
		VotingEndDate:    updated.VotingEndDate,
		IsActive:         updated.IsActive,
		RequiresQuorum:   updated.RequiresQuorum,
		QuorumPercentage: updated.QuorumPercentage,
		CreatedByUserID:  updated.CreatedByUserID,
		Notes:            updated.Notes,
		CreatedAt:        updated.CreatedAt,
		UpdatedAt:        updated.UpdatedAt,
	}, nil
}
