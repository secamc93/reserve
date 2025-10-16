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

	// Un residente solo puede votar una vez por votación
	voted, err := u.repo.HasResidentVoted(ctx, dto.VotingID, dto.ResidentID)
	if err != nil {
		return nil, err
	}
	if voted {
		return nil, fmt.Errorf("el residente ya votó en esta votación")
	}

	entity := domain.Vote{
		VotingID:       dto.VotingID,
		ResidentID:     dto.ResidentID,
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
		ResidentID:     created.ResidentID,
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
