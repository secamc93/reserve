package usecasevote

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/internal/domain"

	"github.com/go-playground/validator/v10"
)

func (u *votingUseCase) CreateVote(ctx context.Context, dto domain.CreateVoteDTO) (*domain.VoteDTO, error) {
	validate := validator.New()
	if err := validate.Struct(dto); err != nil {
		return nil, fmt.Errorf("errores de validación: %w", err)
	}

	// Una unidad solo puede votar una vez por votación
	voted, err := u.repo.HasUnitVoted(ctx, dto.VotingID, dto.PropertyUnitID)
	if err != nil {
		return nil, err
	}
	if voted {
		return nil, fmt.Errorf("la unidad ya votó en esta votación")
	}

	entity := domain.Vote{
		VotingID:       dto.VotingID,
		PropertyUnitID: dto.PropertyUnitID,
		VotingOptionID: dto.VotingOptionID,
		IPAddress:      dto.IPAddress,
		UserAgent:      dto.UserAgent,
		Notes:          dto.Notes,
	}

	created, err := u.repo.CreateVote(ctx, entity)
	if err != nil {
		return nil, err
	}

	// Mapear el voto creado a DTO con todos los datos reales de la BD
	return &domain.VoteDTO{
		ID:             created.ID,
		VotingID:       created.VotingID,
		PropertyUnitID: created.PropertyUnitID,
		VotingOptionID: created.VotingOptionID,
		OptionText:     created.OptionText,
		OptionCode:     created.OptionCode,
		OptionColor:    created.OptionColor,
		VotedAt:        created.VotedAt,
		IPAddress:      created.IPAddress,
		UserAgent:      created.UserAgent,
		Notes:          created.Notes,
	}, nil
}
