package usecasevote

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/shared/log"
)

func (u *votingUseCase) ListVotingGroupsByBusiness(ctx context.Context, businessID uint) ([]domain.VotingGroupDTO, error) {
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

func (u *votingUseCase) UpdateVotingGroup(ctx context.Context, id uint, dto domain.CreateVotingGroupDTO) (*domain.VotingGroupDTO, error) {
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

func (u *votingUseCase) DeactivateVotingGroup(ctx context.Context, id uint) error {
	return u.repo.DeactivateVotingGroup(ctx, id)
}

func (u *votingUseCase) ListVotingsByGroup(ctx context.Context, groupID uint) ([]domain.VotingDTO, error) {
	votings, err := u.repo.ListVotingsByGroup(ctx, groupID)
	if err != nil {
		return nil, err
	}
	res := make([]domain.VotingDTO, len(votings))
	for i := range votings {
		v := votings[i]
		res[i] = domain.VotingDTO{
			ID:                 v.ID,
			VotingGroupID:      v.VotingGroupID,
			Title:              v.Title,
			Description:        v.Description,
			VotingType:         v.VotingType,
			IsSecret:           v.IsSecret,
			AllowAbstention:    v.AllowAbstention,
			IsActive:           v.IsActive,
			DisplayOrder:       v.DisplayOrder,
			RequiredPercentage: v.RequiredPercentage,
			CreatedAt:          v.CreatedAt,
			UpdatedAt:          v.UpdatedAt,
		}
	}
	return res, nil
}

func (u *votingUseCase) UpdateVoting(ctx context.Context, id uint, dto domain.CreateVotingDTO) (*domain.VotingDTO, error) {
	entity := &domain.Voting{
		Title:              dto.Title,
		Description:        dto.Description,
		VotingType:         dto.VotingType,
		IsSecret:           dto.IsSecret,
		AllowAbstention:    dto.AllowAbstention,
		DisplayOrder:       dto.DisplayOrder,
		RequiredPercentage: dto.RequiredPercentage,
	}
	updated, err := u.repo.UpdateVoting(ctx, id, entity)
	if err != nil {
		return nil, err
	}
	return &domain.VotingDTO{
		ID:                 updated.ID,
		VotingGroupID:      updated.VotingGroupID,
		Title:              updated.Title,
		Description:        updated.Description,
		VotingType:         updated.VotingType,
		IsSecret:           updated.IsSecret,
		AllowAbstention:    updated.AllowAbstention,
		IsActive:           updated.IsActive,
		DisplayOrder:       updated.DisplayOrder,
		RequiredPercentage: updated.RequiredPercentage,
		CreatedAt:          updated.CreatedAt,
		UpdatedAt:          updated.UpdatedAt,
	}, nil
}

func (u *votingUseCase) ActivateVoting(ctx context.Context, id uint) error {
	return u.repo.ActivateVoting(ctx, id)
}

func (u *votingUseCase) DeactivateVoting(ctx context.Context, id uint) error {
	return u.repo.DeactivateVoting(ctx, id)
}

func (u *votingUseCase) DeleteVoting(ctx context.Context, id uint) error {
	return u.repo.DeleteVoting(ctx, id)
}

func (u *votingUseCase) ListVotingOptionsByVoting(ctx context.Context, votingID uint) ([]domain.VotingOptionDTO, error) {
	options, err := u.repo.ListVotingOptionsByVoting(ctx, votingID)
	if err != nil {
		return nil, err
	}
	res := make([]domain.VotingOptionDTO, len(options))
	for i := range options {
		o := options[i]
		res[i] = domain.VotingOptionDTO{
			ID:           o.ID,
			VotingID:     o.VotingID,
			OptionText:   o.OptionText,
			OptionCode:   o.OptionCode,
			Color:        o.Color,
			DisplayOrder: o.DisplayOrder,
			IsActive:     o.IsActive,
		}
	}
	return res, nil
}

func (u *votingUseCase) DeactivateVotingOption(ctx context.Context, id uint) error {
	return u.repo.DeactivateVotingOption(ctx, id)
}

func (u *votingUseCase) ListVotesByVoting(ctx context.Context, votingID uint) ([]domain.VoteDTO, error) {
	votes, err := u.repo.ListVotesByVoting(ctx, votingID)
	if err != nil {
		return nil, err
	}
	res := make([]domain.VoteDTO, len(votes))
	for i := range votes {
		v := votes[i]
		res[i] = domain.VoteDTO{
			ID:             v.ID,
			VotingID:       v.VotingID,
			PropertyUnitID: v.PropertyUnitID,
			VotingOptionID: v.VotingOptionID,
			VotedAt:        v.VotedAt,
			IPAddress:      v.IPAddress,
			UserAgent:      v.UserAgent,
			Notes:          v.Notes,
		}
	}
	return res, nil
}
