package app

import (
	"context"
	"time"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/dtos"
	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"
)

const recentPurchases = 10

// GetCoverage devuelve qué días de votación tiene cubiertos la propiedad y qué fechas de sus
// asambleas próximas faltan por cubrir.
func (u *useCase) GetCoverage(ctx context.Context, businessID uint, now time.Time) (*dtos.Coverage, error) {
	cov, purchased, err := u.loadCoverage(ctx, businessID, now)
	if err != nil {
		return nil, err
	}
	upcoming, err := u.repo.UpcomingAssemblies(ctx, businessID, now)
	if err != nil {
		return nil, err
	}
	recent, err := u.repo.ListRecentDayPayments(ctx, businessID, recentPurchases)
	if err != nil {
		return nil, err
	}

	assemblies := make([]dtos.AssemblyCoverage, 0, len(upcoming))
	for _, a := range upcoming {
		from := a.Start
		if from.Before(now) {
			from = now
		}
		dates := entities.DatesBetween(from, a.End)
		uncovered := []string{}
		for _, d := range dates {
			if !cov.covers(d) {
				uncovered = append(uncovered, d)
			}
		}
		assemblies = append(assemblies, dtos.AssemblyCoverage{GroupID: a.GroupID, Name: a.Name, Dates: dates, UncoveredDates: uncovered})
	}

	today := entities.DateOf(now)
	return &dtos.Coverage{
		BusinessID:      businessID,
		Today:           today,
		TodayCovered:    cov.covers(today),
		PropertyExempt:  cov.propertyExempt,
		AdminExempt:     cov.adminExempt,
		Membership:      cov.membership,
		PurchasedDates:  purchased,
		Assemblies:      assemblies,
		PricePerDayCOP:  u.pricePerDayCOP,
		GatewayEnabled:  u.gateway.Enabled(),
		RecentPurchases: recent,
	}, nil
}
