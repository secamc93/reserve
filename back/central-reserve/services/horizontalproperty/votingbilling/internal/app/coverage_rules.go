package app

import (
	"context"
	"time"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"
)

// coverage son los hechos de cobro de una propiedad para decidir qué fechas están cubiertas.
type coverage struct {
	propertyExempt bool
	adminExempt    bool
	membership     *entities.ActiveMembership
	purchased      map[string]bool
}

func (c coverage) exempt() bool { return c.propertyExempt || c.adminExempt }

// covers dice si la fecha (AAAA-MM-DD) está cubierta: exención, membresía vigente ese día o día
// comprado.
func (c coverage) covers(date string) bool {
	if c.exempt() || c.purchased[date] {
		return true
	}
	return c.membership != nil && date <= entities.DateOf(c.membership.EndsAt)
}

func (u *useCase) loadCoverage(ctx context.Context, businessID uint, now time.Time) (coverage, []string, error) {
	var c coverage
	var err error
	if c.propertyExempt, err = u.repo.IsPropertyExempt(ctx, businessID); err != nil {
		return c, nil, err
	}
	if c.adminExempt, err = u.repo.IsAdminExempt(ctx, businessID); err != nil {
		return c, nil, err
	}
	if c.membership, err = u.repo.ActiveMembership(ctx, businessID, now); err != nil {
		return c, nil, err
	}
	purchased, err := u.repo.PurchasedDates(ctx, businessID, entities.DateOf(now))
	if err != nil {
		return c, nil, err
	}
	c.purchased = map[string]bool{}
	for _, d := range purchased {
		c.purchased[d] = true
	}
	return c, purchased, nil
}

// validFutureDates valida fechas AAAA-MM-DD de hoy (Colombia) en adelante, sin repetidos y como
// máximo MaxDatesPerPurchase.
func validFutureDates(dates []string, now time.Time) ([]string, bool) {
	out := entities.UniqueSorted(dates)
	if len(out) == 0 || len(out) > entities.MaxDatesPerPurchase {
		return nil, false
	}
	today := entities.DateOf(now)
	for _, d := range out {
		if _, ok := entities.ParseDate(d); !ok || d < today {
			return nil, false
		}
	}
	return out, true
}
