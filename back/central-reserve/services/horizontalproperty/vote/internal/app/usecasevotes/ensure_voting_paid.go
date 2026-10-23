package usecasevotes

import (
	"context"
	"time"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

// ensureVotingPaid devuelve ErrVotingDayNotPaid si hoy no está cubierto para la propiedad de la
// votación (ver domain.VotingCoverage).
func (u *VotesUseCase) ensureVotingPaid(ctx context.Context, votingID uint) error {
	cov, err := u.repo.GetVotingCoverage(ctx, votingID, time.Now())
	if err != nil {
		u.logger.Error(ctx).Err(err).Uint("voting_id", votingID).Msg("Error verificando el día de votación")
		return err
	}
	if !cov.Covered() {
		u.logger.Warn(ctx).Uint("voting_id", votingID).Msg("Voto rechazado: día de votación sin cubrir")
		return domain.ErrVotingDayNotPaid
	}
	return nil
}
