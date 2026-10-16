package app

import (
	"context"
	"time"

	"central_reserve/services/horizontalproperty/packages/internal/domain"
	"central_reserve/shared/log"
)

// GetPackagesSummary cuenta los paquetes por grupo para los chips de la portería:
// por entregar (y cuántos llevan más de PackageOverdueAfter), entregados hoy, entregados y
// devueltos/perdidos. "Hoy" es el día en hora de Colombia.
func (uc *packageUseCase) GetPackagesSummary(ctx context.Context, businessID uint, now time.Time) (*domain.PackagesSummaryDTO, error) {
	ctx = log.WithFunctionCtx(ctx, "GetPackagesSummary")

	count := func(group string, receivedBefore, deliveredSince *time.Time) (int64, error) {
		return uc.packageRepo.CountPackagesByStatusCodes(ctx, businessID, domain.PackageStatusGroups[group], receivedBefore, deliveredSince)
	}

	overdueLimit := now.Add(-domain.PackageOverdueAfter)
	startOfDay := domain.StartOfDay(now)

	summary := &domain.PackagesSummaryDTO{}
	var err error
	if summary.Pending, err = count(domain.PackageGroupPending, nil, nil); err != nil {
		return nil, uc.summaryError(ctx, err)
	}
	if summary.PendingOverdue, err = count(domain.PackageGroupPending, &overdueLimit, nil); err != nil {
		return nil, uc.summaryError(ctx, err)
	}
	if summary.Delivered, err = count(domain.PackageGroupDelivered, nil, nil); err != nil {
		return nil, uc.summaryError(ctx, err)
	}
	if summary.DeliveredToday, err = count(domain.PackageGroupDelivered, nil, &startOfDay); err != nil {
		return nil, uc.summaryError(ctx, err)
	}
	if summary.Closed, err = count(domain.PackageGroupClosed, nil, nil); err != nil {
		return nil, uc.summaryError(ctx, err)
	}
	summary.Total = summary.Pending + summary.Delivered + summary.Closed
	return summary, nil
}

func (uc *packageUseCase) summaryError(ctx context.Context, err error) error {
	uc.logger.Error(ctx).Err(err).Msg("Error contando paquetes")
	return err
}
