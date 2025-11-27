package usecasevotingoptions

import (
	"context"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

func (u *VotingOptionsUseCase) GetVotingOptionByID(ctx context.Context, id uint) (*domain.VotingOptionDTO, error) {
	option, err := u.repo.GetVotingOptionByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return &domain.VotingOptionDTO{
		ID:           option.ID,
		VotingID:     option.VotingID,
		OptionText:   option.OptionText,
		OptionCode:   option.OptionCode,
		Color:        option.Color,
		DisplayOrder: option.DisplayOrder,
		IsActive:     option.IsActive,
	}, nil
}
