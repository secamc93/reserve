package usecasevotes

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/shared/log"
)

// CreateBulkVotes procesa múltiples votos reutilizando el flujo individual (validación, BD, SSE)
func (u *VotesUseCase) CreateBulkVotes(ctx context.Context, dto domain.CreateBulkVotesDTO) (*domain.BulkVoteResultDTO, error) {
	ctx = log.WithFunctionCtx(ctx, "CreateBulkVotes")

	if len(dto.PropertyUnitIDs) == 0 {
		return nil, fmt.Errorf("se requiere al menos una unidad para votación masiva")
	}

	u.logger.Info(ctx).
		Uint("voting_id", dto.VotingID).
		Uint("voting_option_id", dto.VotingOptionID).
		Int("units_count", len(dto.PropertyUnitIDs)).
		Bool("auto_mark_attendance", dto.AutoMarkAttendance).
		Msg("Iniciando votación masiva")

	result := &domain.BulkVoteResultDTO{
		TotalProcessed: len(dto.PropertyUnitIDs),
		Results:        make([]domain.BulkVoteItemResultDTO, 0, len(dto.PropertyUnitIDs)),
	}

	for _, unitID := range dto.PropertyUnitIDs {
		itemResult := domain.BulkVoteItemResultDTO{
			PropertyUnitID: unitID,
		}

		// Si auto-asistencia está habilitada, marcar asistencia primero
		if dto.AutoMarkAttendance {
			if err := u.repo.MarkUnitAttendanceForVoting(ctx, dto.VotingID, unitID, true); err != nil {
				u.logger.Warn(ctx).
					Err(err).
					Uint("voting_id", dto.VotingID).
					Uint("property_unit_id", unitID).
					Msg("Warning: no se pudo marcar asistencia automática, continuando con el voto")
			}
		}

		// Reutilizar el flujo completo de CreateVote (validación asistencia, check duplicado, INSERT, SSE)
		voteDTO, err := u.CreateVote(ctx, domain.CreateVoteDTO{
			VotingID:       dto.VotingID,
			PropertyUnitID: unitID,
			VotingOptionID: dto.VotingOptionID,
			IPAddress:      dto.IPAddress,
			UserAgent:      dto.UserAgent,
			Notes:          dto.Notes,
		})

		if err != nil {
			itemResult.Success = false
			itemResult.Error = err.Error()
			result.Failed++
			u.logger.Warn(ctx).
				Err(err).
				Uint("property_unit_id", unitID).
				Msg("Voto masivo fallido para unidad")
		} else {
			itemResult.Success = true
			itemResult.Vote = voteDTO
			result.Succeeded++
		}

		result.Results = append(result.Results, itemResult)
	}

	u.logger.Info(ctx).
		Uint("voting_id", dto.VotingID).
		Int("total", result.TotalProcessed).
		Int("succeeded", result.Succeeded).
		Int("failed", result.Failed).
		Msg("Votación masiva completada")

	return result, nil
}
