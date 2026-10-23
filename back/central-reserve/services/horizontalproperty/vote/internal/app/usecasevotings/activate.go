package usecasevotings

import (
	"context"
	"time"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

// ActivateVoting abre una votación. Si hoy no está cubierto (día comprado, membresía o exención)
// no se puede abrir.
func (u *VotingsUseCase) ActivateVoting(ctx context.Context, id uint) error {
	cov, err := u.repo.GetVotingCoverage(ctx, id, time.Now())
	if err != nil {
		return err
	}
	if !cov.Covered() {
		return domain.ErrVotingDayNotPaid
	}
	return u.repo.ActivateVoting(ctx, id)
}
