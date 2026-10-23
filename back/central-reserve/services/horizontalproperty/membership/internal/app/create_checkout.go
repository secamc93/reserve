package app

import (
	"context"
	"fmt"
	"net/url"

	"central_reserve/services/horizontalproperty/membership/internal/domain/dtos"
	"central_reserve/services/horizontalproperty/membership/internal/domain/entities"
	domainerrors "central_reserve/services/horizontalproperty/membership/internal/domain/errors"
	"central_reserve/shared/log"
)

// CreateCheckout crea una membresía pendiente del plan para las propiedades elegidas y devuelve el
// enlace de la pasarela. Valida el tope del plan y que el usuario administre esas propiedades (el
// super admin puede comprar para cualquiera).
func (u *useCase) CreateCheckout(ctx context.Context, req dtos.CheckoutRequest) (*dtos.Checkout, error) {
	ctx = log.WithFunctionCtx(ctx, "CreateCheckout")

	if !u.gateway.Enabled() {
		return nil, domainerrors.ErrGatewayNotConfigured
	}
	if !validRedirectURL(req.RedirectURL) {
		return nil, domainerrors.ErrInvalidRedirectURL
	}
	plan, ok := entities.PlanByCode(req.PlanCode)
	if !ok {
		return nil, domainerrors.ErrPlanNotFound
	}
	ids := entities.UniqueIDs(req.BusinessIDs)
	if len(ids) == 0 || len(ids) > plan.MaxProperties {
		return nil, domainerrors.ErrInvalidProperties
	}
	if !req.IsSuperAdmin {
		if err := u.ensureManaged(ctx, req.UserID, ids); err != nil {
			return nil, err
		}
	}

	owner := req.UserID
	m, p, err := u.repo.CreatePending(ctx, &entities.Membership{
		PlanCode: plan.Code, MaxProperties: plan.MaxProperties, OwnerUserID: &owner, Status: entities.MembershipPending,
		Source: entities.SourceWompi, CreatedByUserID: &owner, BusinessIDs: ids,
	}, &entities.Payment{
		Reference:     fmt.Sprintf("MEMB-%d-%d", req.UserID, u.now().UnixNano()),
		AmountInCents: plan.PriceCOP * 100, Currency: currencyCOP, Status: entities.PaymentPending, CreatedByUserID: &owner,
	})
	if err != nil {
		return nil, err
	}
	checkoutURL, err := u.gateway.CheckoutURL(p.Reference, p.AmountInCents, p.Currency, req.RedirectURL)
	if err != nil {
		return nil, err
	}
	u.logger.Info(ctx).Uint("user_id", req.UserID).Str("plan", plan.Code).Str("reference", p.Reference).Msg("Compra de membresía iniciada")
	return &dtos.Checkout{Membership: *m, Payment: *p, CheckoutURL: checkoutURL}, nil
}

func (u *useCase) ensureManaged(ctx context.Context, userID uint, ids []uint) error {
	managed, err := u.repo.ManagedBusinessIDs(ctx, userID)
	if err != nil {
		return err
	}
	own := map[uint]bool{}
	for _, id := range managed {
		own[id] = true
	}
	for _, id := range ids {
		if !own[id] {
			return domainerrors.ErrPropertyNotManaged
		}
	}
	return nil
}

func validRedirectURL(raw string) bool {
	parsed, err := url.Parse(raw)
	if err != nil {
		return false
	}
	return (parsed.Scheme == "http" || parsed.Scheme == "https") && parsed.Host != ""
}
