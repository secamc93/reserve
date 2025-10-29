package usecasevote

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/shared/log"

	"github.com/go-playground/validator/v10"
)

func (u *votingUseCase) CreateVoting(ctx context.Context, dto domain.CreateVotingDTO) (*domain.VotingDTO, error) {
	// Configurar contexto de logging
	ctx = log.WithFunctionCtx(ctx, "CreateVoting")

	validate := validator.New()
	if err := validate.Struct(dto); err != nil {
		u.logger.Error(ctx).Err(err).Uint("voting_group_id", dto.VotingGroupID).Str("title", dto.Title).Msg("Errores de validación en CreateVoting")
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
		u.logger.Error(ctx).Err(err).Uint("voting_group_id", dto.VotingGroupID).Str("title", dto.Title).Msg("Error creando votación en repositorio")
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
