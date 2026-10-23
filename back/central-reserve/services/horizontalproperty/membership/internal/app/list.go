package app

import (
	"context"

	"central_reserve/services/horizontalproperty/membership/internal/domain/entities"
)

// ListPlans devuelve el catálogo de planes a la venta.
func (u *useCase) ListPlans() []entities.Plan {
	return entities.Plans
}

// ListMine lista las membresías que compró el usuario.
func (u *useCase) ListMine(ctx context.Context, userID uint) ([]entities.Membership, error) {
	return u.repo.ListByOwner(ctx, userID, listLimit)
}

// ListForBusiness lista las membresías que incluyen la propiedad.
func (u *useCase) ListForBusiness(ctx context.Context, businessID uint) ([]entities.Membership, error) {
	return u.repo.ListByBusiness(ctx, businessID, listLimit)
}
