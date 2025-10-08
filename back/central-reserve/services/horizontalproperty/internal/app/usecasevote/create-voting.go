package usecasevote

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/internal/domain"

	"github.com/go-playground/validator/v10"
)

func (u *votingUseCase) CreateVoting(ctx context.Context, dto domain.CreateVotingDTO) (*domain.VotingDTO, error) {
	validate := validator.New()
	if err := validate.Struct(dto); err != nil {
		return nil, fmt.Errorf("errores de validación: %w", err)
	}

	entity := &domain.Voting{
		VotingGroupID:      dto.VotingGroupID,
		Title:              dto.Title,
		Description:        dto.Description,
		VotingType:         dto.VotingType,
		IsSecret:           dto.IsSecret,
		AllowAbstention:    dto.AllowAbstention,
		DisplayOrder:       dto.DisplayOrder,
		RequiredPercentage: dto.RequiredPercentage,
	}

	created, err := u.repo.CreateVoting(ctx, entity)
	if err != nil {
		return nil, err
	}

	return &domain.VotingDTO{
		ID:                 created.ID,
		VotingGroupID:      created.VotingGroupID,
		Title:              created.Title,
		Description:        created.Description,
		VotingType:         created.VotingType,
		IsSecret:           created.IsSecret,
		AllowAbstention:    created.AllowAbstention,
		IsActive:           created.IsActive,
		DisplayOrder:       created.DisplayOrder,
		RequiredPercentage: created.RequiredPercentage,
		CreatedAt:          created.CreatedAt,
		UpdatedAt:          created.UpdatedAt,
	}, nil
}
