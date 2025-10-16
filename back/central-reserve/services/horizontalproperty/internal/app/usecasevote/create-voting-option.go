package usecasevote

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/internal/domain"

	"github.com/go-playground/validator/v10"
)

func (u *votingUseCase) CreateVotingOption(ctx context.Context, dto domain.CreateVotingOptionDTO) (*domain.VotingOptionDTO, error) {
	validate := validator.New()
	if err := validate.Struct(dto); err != nil {
		return nil, fmt.Errorf("errores de validación: %w", err)
	}

	entity := &domain.VotingOption{
		VotingID:     dto.VotingID,
		OptionText:   dto.OptionText,
		OptionCode:   dto.OptionCode,
		Color:        dto.Color,
		DisplayOrder: dto.DisplayOrder,
	}

	created, err := u.repo.CreateVotingOption(ctx, entity)
	if err != nil {
		return nil, err
	}

	return &domain.VotingOptionDTO{
		ID:           created.ID,
		VotingID:     created.VotingID,
		OptionText:   created.OptionText,
		OptionCode:   created.OptionCode,
		Color:        created.Color,
		DisplayOrder: created.DisplayOrder,
		IsActive:     created.IsActive,
	}, nil
}

}

}

}
