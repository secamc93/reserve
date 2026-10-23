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

// CreateDaysCheckout registra un pago pendiente por las fechas pedidas que no estén ya cubiertas y
// devuelve el enlace de la pasarela. El monto lo calcula el back.
func (u *useCase) CreateDaysCheckout(ctx context.Context, req dtos.DaysCheckoutRequest) (*dtos.Checkout, error) {
	ctx = log.WithFunctionCtx(ctx, "CreateDaysCheckout")

	if !u.gateway.Enabled() {
		return nil, domainerrors.ErrGatewayNotConfigured
	}
	if !validRedirectURL(req.RedirectURL) {
		return nil, domainerrors.ErrInvalidRedirectURL
	}
	dates, ok := validFutureDates(req.Dates, req.Now)
	if !ok {
		return nil, domainerrors.ErrInvalidDates
	}
	cov, _, err := u.loadCoverage(ctx, req.BusinessID, req.Now)
	if err != nil {
		return nil, err
	}
	var due []string
	for _, d := range dates {
		if !cov.covers(d) {
			due = append(due, d)
		}
	}
	if len(due) == 0 {
		return nil, domainerrors.ErrNothingDue
	}

	payment, err := u.repo.CreateDayPayment(ctx, &entities.DayPayment{
		BusinessID:      req.BusinessID,
		Reference:       fmt.Sprintf("DIA-%d-%d", req.BusinessID, u.now().UnixNano()),
		Source:          entities.SourceWompi,
		Dates:           due,
		AmountInCents:   int64(len(due)) * u.pricePerDayCOP * 100,
		Currency:        currencyCOP,
		Status:          entities.StatusPending,
		CreatedByUserID: req.UserID,
	})
	if err != nil {
		return nil, err
	}
	checkoutURL, err := u.gateway.CheckoutURL(payment.Reference, payment.AmountInCents, payment.Currency, req.RedirectURL)
	if err != nil {
		return nil, err
	}
	u.logger.Info(ctx).Uint("business_id", req.BusinessID).Str("reference", payment.Reference).Strs("dates", due).Msg("Compra de días de votación iniciada")
	return &dtos.Checkout{Payment: *payment, CheckoutURL: checkoutURL}, nil
}

func validRedirectURL(raw string) bool {
	parsed, err := url.Parse(raw)
	if err != nil {
		return false
	}
	return (parsed.Scheme == "http" || parsed.Scheme == "https") && parsed.Host != ""
}
