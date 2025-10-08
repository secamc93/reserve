package usecasevote

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/internal/domain"

	"github.com/go-playground/validator/v10"
)

func (u *votingUseCase) CreateVotingGroup(ctx context.Context, dto domain.CreateVotingGroupDTO) (*domain.VotingGroupDTO, error) {
	validate := validator.New()
	if err := validate.Struct(dto); err != nil {
		u.logger.Error().Err(err).Msg("Errores de validación en CreateVotingGroup")
		return nil, fmt.Errorf("errores de validación: %w", err)
	}

	if dto.RequiresQuorum && (dto.QuorumPercentage == nil) {
		return nil, fmt.Errorf("debe especificar quorum_percentage cuando requires_quorum es true")
	}

	entity := &domain.VotingGroup{
		BusinessID:       dto.BusinessID,
		Name:             dto.Name,
		Description:      dto.Description,
		VotingStartDate:  dto.VotingStartDate,
		VotingEndDate:    dto.VotingEndDate,
		RequiresQuorum:   dto.RequiresQuorum,
		QuorumPercentage: dto.QuorumPercentage,
		CreatedByUserID:  dto.CreatedByUserID,
		Notes:            dto.Notes,
	}

	created, err := u.repo.CreateVotingGroup(ctx, entity)
	if err != nil {
		return nil, err
	}

	return &domain.VotingGroupDTO{
		ID:               created.ID,
		BusinessID:       created.BusinessID,
		Name:             created.Name,
		Description:      created.Description,
		VotingStartDate:  created.VotingStartDate,
		VotingEndDate:    created.VotingEndDate,
		IsActive:         created.IsActive,
		RequiresQuorum:   created.RequiresQuorum,
		QuorumPercentage: created.QuorumPercentage,
		CreatedByUserID:  created.CreatedByUserID,
		Notes:            created.Notes,
		CreatedAt:        created.CreatedAt,
		UpdatedAt:        created.UpdatedAt,
	}, nil
}
