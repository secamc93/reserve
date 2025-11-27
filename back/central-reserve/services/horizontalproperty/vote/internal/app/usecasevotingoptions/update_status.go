package usecasevotingoptions

import (
	"context"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

func (u *VotingOptionsUseCase) UpdateVotingOptionStatus(ctx context.Context, id uint, isActive bool) (*domain.VotingOptionDTO, error) {
	if err := u.repo.UpdateVotingOptionStatus(ctx, id, isActive); err != nil {
		return nil, err
	}
	return u.GetVotingOptionByID(ctx, id)
}
