package usecasevote

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/shared/log"
)

// GetVotingByID obtiene una votación por su ID con opciones
func (uc *votingUseCase) GetVotingByID(ctx context.Context, hpID, groupID, votingID uint) (*domain.VotingDTO, error) {
	// Configurar contexto de logging
	ctx = log.WithFunctionCtx(ctx, "GetVotingByID")

	// Obtener votación de base de datos
	voting, err := uc.repo.GetVotingByID(ctx, votingID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("voting_id", votingID).Msg("Error obteniendo votación desde repositorio")
		return nil, fmt.Errorf("votación no encontrada")
	}

	// Validar que la votación pertenezca al grupo correcto
	if voting.VotingGroupID != groupID {
		uc.logger.Warn(ctx).Uint("voting_id", votingID).
			Uint("expected_group", groupID).Uint("actual_group", voting.VotingGroupID).
			Msg("La votación no pertenece al grupo especificado")
		return nil, fmt.Errorf("votación no encontrada")
	}

	// Obtener opciones de votación
	options, err := uc.repo.ListVotingOptionsByVoting(ctx, votingID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("voting_id", votingID).Msg("Error obteniendo opciones de votación desde repositorio")
		return nil, fmt.Errorf("error obteniendo opciones de votación")
	}

	// Construir DTO con opciones
	dto := &domain.VotingDTO{
		ID:                 voting.ID,
		VotingGroupID:      voting.VotingGroupID,
		Title:              voting.Title,
		Description:        voting.Description,
		VotingType:         voting.VotingType,
		IsSecret:           voting.IsSecret,
		AllowAbstention:    voting.AllowAbstention,
		IsActive:           voting.IsActive,
		DisplayOrder:       voting.DisplayOrder,
		RequiredPercentage: voting.RequiredPercentage,
		CreatedAt:          voting.CreatedAt,
		UpdatedAt:          voting.UpdatedAt,
		Options:            make([]domain.VotingOptionDTO, 0, len(options)),
	}

	// Mapear opciones
	for _, opt := range options {
		dto.Options = append(dto.Options, domain.VotingOptionDTO{
			ID:           opt.ID,
			VotingID:     opt.VotingID,
			OptionText:   opt.OptionText,
			OptionCode:   opt.OptionCode,
			Color:        opt.Color,
			DisplayOrder: opt.DisplayOrder,
			IsActive:     opt.IsActive,
		})
	}

	return dto, nil
}
