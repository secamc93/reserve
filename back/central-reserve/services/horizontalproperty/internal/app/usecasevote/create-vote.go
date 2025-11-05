package usecasevote

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/shared/log"

	"github.com/go-playground/validator/v10"
)

func (u *votingUseCase) CreateVote(ctx context.Context, dto domain.CreateVoteDTO) (*domain.VoteDTO, error) {
	// Configurar contexto de logging
	ctx = log.WithFunctionCtx(ctx, "CreateVote")

	validate := validator.New()
	if err := validate.Struct(dto); err != nil {
		u.logger.Error(ctx).Err(err).Uint("voting_id", dto.VotingID).Uint("property_unit_id", dto.PropertyUnitID).Msg("Errores de validación en CreateVote")
		return nil, fmt.Errorf("errores de validación: %w", err)
	}

	// Verificar que la unidad tenga asistencia marcada para esta votación
	hasAttendance, err := u.repo.CheckUnitAttendanceForVoting(ctx, dto.VotingID, dto.PropertyUnitID)
	if err != nil {
		u.logger.Error(ctx).Err(err).Uint("voting_id", dto.VotingID).Uint("property_unit_id", dto.PropertyUnitID).Msg("Error verificando asistencia de unidad")
		return nil, err
	}
	if !hasAttendance {
		u.logger.Warn(ctx).Uint("voting_id", dto.VotingID).Uint("property_unit_id", dto.PropertyUnitID).Msg("Unidad no registra asistencia para votación")
		return nil, fmt.Errorf("unidad no registra asistencia")
	}

	// Una unidad solo puede votar una vez por votación
	voted, err := u.repo.HasUnitVoted(ctx, dto.VotingID, dto.PropertyUnitID)
	if err != nil {
		u.logger.Error(ctx).Err(err).Uint("voting_id", dto.VotingID).Uint("property_unit_id", dto.PropertyUnitID).Msg("Error verificando si unidad ya votó")
		return nil, err
	}
	if voted {
		u.logger.Warn(ctx).Uint("voting_id", dto.VotingID).Uint("property_unit_id", dto.PropertyUnitID).Msg("Unidad ya votó en esta votación")
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
		u.logger.Error(ctx).Err(err).Uint("voting_id", dto.VotingID).Uint("property_unit_id", dto.PropertyUnitID).Uint("voting_option_id", dto.VotingOptionID).Msg("Error creando voto en repositorio")
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
