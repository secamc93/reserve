package app

import (
	"context"
	"time"

	"central_reserve/services/horizontalproperty/dashboard/internal/domain"
)

// GetToday ver domain.DashboardUseCase.
func (uc *DashboardUseCase) GetToday(ctx context.Context, businessID uint, today time.Time) (*domain.TodaySummary, error) {
	if businessID == 0 {
		return nil, domain.ErrBusinessRequired
	}
	return uc.repo.GetTodaySummary(ctx, businessID, today)
}
