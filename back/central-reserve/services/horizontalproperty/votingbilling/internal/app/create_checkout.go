package app

import (
	"context"
	"fmt"
	"net/url"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/dtos"
	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"
	domainerrors "central_reserve/services/horizontalproperty/votingbilling/internal/domain/errors"
	"central_reserve/shared/log"
)

// CreateCheckout registra un pago pendiente por los días que debe el grupo y devuelve el enlace de
// la pasarela. El monto lo calcula el back; el front solo redirige.
func (u *useCase) CreateCheckout(ctx context.Context, req dtos.CheckoutRequest) (*dtos.Checkout, error) {
	ctx = log.WithFunctionCtx(ctx, "CreateCheckout")

	if !u.gateway.Enabled() {
		return nil, domainerrors.ErrGatewayNotConfigured
	}
	if !validRedirectURL(req.RedirectURL) {
		return nil, domainerrors.ErrInvalidRedirectURL
	}
	group, err := u.ownedGroup(ctx, req.BusinessID, req.VotingGroupID)
	if err != nil {
		return nil, err
	}
	st, err := u.status(ctx, group)
	if err != nil {
		return nil, err
	}
	if st.Paid {
		return nil, domainerrors.ErrNothingDue
	}

	payment, err := u.repo.CreatePayment(ctx, &entities.Payment{
		BusinessID:      group.BusinessID,
		VotingGroupID:   group.ID,
		Reference:       fmt.Sprintf("RUPU-%d-%d", group.ID, u.now().UnixNano()),
		Provider:        entities.ProviderWompi,
		Days:            st.DueDays,
		AmountInCents:   st.AmountDueInCents,
		Currency:        currencyCOP,
		Status:          entities.StatusPending,
		CreatedByUserID: req.UserID,
	})
	if err != nil {
		return nil, err
	}

	checkoutURL, err := u.gateway.CheckoutURL(dtos.CheckoutParams{
		Reference:     payment.Reference,
		AmountInCents: payment.AmountInCents,
		Currency:      payment.Currency,
		RedirectURL:   req.RedirectURL,
	})
	if err != nil {
		return nil, err
	}

	u.logger.Info(ctx).Uint("voting_group_id", group.ID).Str("reference", payment.Reference).
		Int("days", payment.Days).Int64("amount_in_cents", payment.AmountInCents).Msg("Pago de días de votación iniciado")
	return &dtos.Checkout{Payment: *payment, CheckoutURL: checkoutURL}, nil
}

func validRedirectURL(raw string) bool {
	parsed, err := url.Parse(raw)
	if err != nil {
		return false
	}
	return (parsed.Scheme == "http" || parsed.Scheme == "https") && parsed.Host != ""
}
