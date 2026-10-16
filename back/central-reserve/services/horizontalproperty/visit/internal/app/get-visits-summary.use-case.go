package app

import (
	"context"
	"time"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/shared/log"
)

// GetVisitsSummary cuenta las visitas programadas en un día por estado de portería (dentro,
// esperadas, salieron, canceladas) y cuántos visitantes están dentro ahora.
func (uc *visitUseCase) GetVisitsSummary(ctx context.Context, businessID uint, day time.Time) (*domain.VisitsSummaryDTO, error) {
	ctx = log.WithFunctionCtx(ctx, "GetVisitsSummary")

	from := time.Date(day.Year(), day.Month(), day.Day(), 0, 0, 0, 0, time.UTC)
	to := from.Add(24 * time.Hour)

	count := func(state string, from, to *time.Time) (int64, error) {
		n, err := uc.visitRepo.CountVisitsByStatusCodes(ctx, businessID, domain.VisitStateGroups[state], from, to)
		if err != nil {
			uc.logger.Error(ctx).Err(err).Str("state", state).Msg("Error contando visitas")
		}
		return n, err
	}

	s := &domain.VisitsSummaryDTO{}
	var err error
	if s.Inside, err = count(domain.VisitStateInside, &from, &to); err != nil {
		return nil, err
	}
	if s.Expected, err = count(domain.VisitStateExpected, &from, &to); err != nil {
		return nil, err
	}
	if s.Left, err = count(domain.VisitStateLeft, &from, &to); err != nil {
		return nil, err
	}
	if s.Cancelled, err = count(domain.VisitStateCancelled, &from, &to); err != nil {
		return nil, err
	}
	if s.InsideNow, err = count(domain.VisitStateInside, nil, nil); err != nil {
		return nil, err
	}
	s.Total = s.Inside + s.Expected + s.Left + s.Cancelled
	return s, nil
}
