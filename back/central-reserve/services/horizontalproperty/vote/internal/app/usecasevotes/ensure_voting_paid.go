package usecasevotes

import (
	"context"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

// ensureVotingPaid devuelve ErrVotingDayNotPaid si el grupo de la votación debe días de votación.
func (u *VotesUseCase) ensureVotingPaid(ctx context.Context, votingID uint) error {
	pending, err := u.repo.IsVotingPaymentPending(ctx, votingID)
	if err != nil {
		u.logger.Error(ctx).Err(err).Uint("voting_id", votingID).Msg("Error verificando el pago del día de votación")
		return err
	}
	if pending {
		u.logger.Warn(ctx).Uint("voting_id", votingID).Msg("Voto rechazado: día de votación sin pagar")
		return domain.ErrVotingDayNotPaid
	}
	return nil
}
