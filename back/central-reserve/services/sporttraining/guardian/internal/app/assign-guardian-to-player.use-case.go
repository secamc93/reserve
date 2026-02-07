package app

import (
	"context"
	"time"

	"central_reserve/services/sporttraining/guardian/internal/domain"
	"central_reserve/shared/log"
)

func (uc *guardianUseCase) AssignGuardianToPlayer(ctx context.Context, dto domain.AssignGuardianDTO) error {
	ctx = log.WithFunctionCtx(ctx, "AssignGuardianToPlayer")

	assignment := &domain.PlayerGuardianAssignment{
		PlayerID:            dto.PlayerID,
		GuardianID:          dto.GuardianID,
		RelationshipType:    dto.RelationshipType,
		IsPrimaryGuardian:   dto.IsPrimaryGuardian,
		CanPickup:           dto.CanPickup,
		CanBookSessions:     dto.CanBookSessions,
		HasMedicalAuthority: dto.HasMedicalAuthority,
		StartDate:           time.Now(),
	}

	err := uc.repo.AssignToPlayer(ctx, assignment)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msgf("Error asignando tutor %d a jugador %d", dto.GuardianID, dto.PlayerID)
		return err
	}

	uc.logger.Info(ctx).Msgf("Tutor %d asignado a jugador %d", dto.GuardianID, dto.PlayerID)
	return nil
}
