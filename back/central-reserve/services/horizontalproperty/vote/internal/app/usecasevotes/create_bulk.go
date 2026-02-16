package usecasevotes

import (
	"context"
	"fmt"
	"sync"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/shared/log"
)

const defaultBulkWorkers = 10

// CreateBulkVotes procesa múltiples votos concurrentemente usando un worker pool.
// Cada goroutine escribe en su propio índice del slice de resultados (sin mutex).
// El canal semáforo limita la concurrencia a defaultBulkWorkers para no saturar el pool de BD.
func (u *VotesUseCase) CreateBulkVotes(ctx context.Context, dto domain.CreateBulkVotesDTO) (*domain.BulkVoteResultDTO, error) {
	ctx = log.WithFunctionCtx(ctx, "CreateBulkVotes")

	if len(dto.PropertyUnitIDs) == 0 {
		return nil, fmt.Errorf("se requiere al menos una unidad para votación masiva")
	}

	unitCount := len(dto.PropertyUnitIDs)

	u.logger.Info(ctx).
		Uint("voting_id", dto.VotingID).
		Int("units_count", unitCount).
		Int("max_workers", defaultBulkWorkers).
		Msg("Iniciando votación masiva concurrente")

	// Pre-allocate: cada goroutine escribe en su propio índice (sin mutex)
	results := make([]domain.BulkVoteItemResultDTO, unitCount)

	// Canal semáforo limita concurrencia a defaultBulkWorkers
	sem := make(chan struct{}, defaultBulkWorkers)
	var wg sync.WaitGroup

	for i, unitID := range dto.PropertyUnitIDs {
		// Verificar cancelación antes de lanzar nueva goroutine
		if ctx.Err() != nil {
			for j := i; j < unitCount; j++ {
				results[j] = domain.BulkVoteItemResultDTO{
					PropertyUnitID: dto.PropertyUnitIDs[j],
					Success:        false,
					Error:          "operación cancelada",
				}
			}
			break
		}

		wg.Add(1)
		sem <- struct{}{} // Adquirir slot (bloquea si pool lleno)

		go func(idx int, uid uint) {
			defer wg.Done()
			defer func() { <-sem }() // Liberar slot

			results[idx] = u.processOneVote(ctx, dto, uid)
		}(i, unitID)
	}

	wg.Wait()

	// Computar contadores del slice ya completo
	succeeded, failed := 0, 0
	for _, r := range results {
		if r.Success {
			succeeded++
		} else {
			failed++
		}
	}

	result := &domain.BulkVoteResultDTO{
		TotalProcessed: unitCount,
		Succeeded:      succeeded,
		Failed:         failed,
		Results:        results,
	}

	u.logger.Info(ctx).
		Uint("voting_id", dto.VotingID).
		Int("total", result.TotalProcessed).
		Int("succeeded", result.Succeeded).
		Int("failed", result.Failed).
		Msg("Votación masiva completada")

	return result, nil
}

// processOneVote maneja un voto individual. Safe para llamar concurrentemente.
func (u *VotesUseCase) processOneVote(ctx context.Context, dto domain.CreateBulkVotesDTO, unitID uint) domain.BulkVoteItemResultDTO {
	itemResult := domain.BulkVoteItemResultDTO{PropertyUnitID: unitID}

	if dto.AutoMarkAttendance {
		if err := u.repo.MarkUnitAttendanceForVoting(ctx, dto.VotingID, unitID, true); err != nil {
			u.logger.Warn(ctx).Err(err).Uint("property_unit_id", unitID).
				Msg("Warning: no se pudo marcar asistencia automática")
		}
	}

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
		u.logger.Warn(ctx).Err(err).Uint("property_unit_id", unitID).Msg("Voto masivo fallido")
	} else {
		itemResult.Success = true
		itemResult.Vote = voteDTO
	}

	return itemResult
}
