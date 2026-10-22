package usecasevotings

import (
	"context"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

// ActivateVoting abre una votación. Sin el día de votación pagado no se puede abrir.
func (u *VotingsUseCase) ActivateVoting(ctx context.Context, id uint) error {
	pending, err := u.repo.IsVotingPaymentPending(ctx, id)
	if err != nil {
		return err
	}
	if pending {
		return domain.ErrVotingDayNotPaid
	}
	return u.repo.ActivateVoting(ctx, id)
}
