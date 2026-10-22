package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/horizontalproperty/votingbilling/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/dtos"
	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"
	domainerrors "central_reserve/services/horizontalproperty/votingbilling/internal/domain/errors"
)

func checkoutReq() dtos.CheckoutRequest {
	return dtos.CheckoutRequest{BusinessID: businessID, VotingGroupID: groupID, RedirectURL: "http://localhost:3005/votaciones/42"}
}

func TestCreateCheckout_CobraLosDiasPendientesYFirmaConLaPasarela(t *testing.T) {
	repo := repoWith(group(2), false, 0)
	var saved *entities.Payment
	repo.CreatePaymentFn = func(_ context.Context, p *entities.Payment) (*entities.Payment, error) {
		cp := *p
		cp.ID = 1
		saved = &cp
		return &cp, nil
	}
	var sent dtos.CheckoutParams
	gw := &mocks.GatewayMock{
		EnabledFn:     func() bool { return true },
		CheckoutURLFn: func(p dtos.CheckoutParams) (string, error) { sent = p; return "https://checkout.wompi.co/p/?x", nil },
	}

	out, err := newUseCase(repo, gw).CreateCheckout(context.Background(), checkoutReq())
	if err != nil {
		t.Fatalf("CreateCheckout: %v", err)
	}
	if saved == nil || saved.Status != entities.StatusPending || saved.Provider != entities.ProviderWompi {
		t.Fatalf("pago guardado = %+v, se esperaba PENDING de wompi", saved)
	}
	if saved.Days != 2 || saved.AmountInCents != 2*price*100 || saved.Currency != "COP" {
		t.Fatalf("pago = %d días, %d centavos, %s; se esperaba 2, %d, COP", saved.Days, saved.AmountInCents, saved.Currency, 2*price*100)
	}
	if sent.Reference != saved.Reference || sent.AmountInCents != saved.AmountInCents || sent.RedirectURL != checkoutReq().RedirectURL {
		t.Fatalf("a la pasarela llegó %+v, no coincide con el pago %+v", sent, saved)
	}
	if out.CheckoutURL == "" {
		t.Fatal("no devolvió el enlace de pago")
	}
}

func TestCreateCheckout_GrupoYaPagadoNoCreaOtroPago(t *testing.T) {
	repo := repoWith(group(1), false, 1)
	repo.CreatePaymentFn = func(context.Context, *entities.Payment) (*entities.Payment, error) {
		t.Fatal("no debía crear un pago")
		return nil, nil
	}
	_, err := newUseCase(repo, enabledGateway()).CreateCheckout(context.Background(), checkoutReq())
	if !errors.Is(err, domainerrors.ErrNothingDue) {
		t.Fatalf("err = %v, se esperaba ErrNothingDue", err)
	}
}

func TestCreateCheckout_SinPasarelaConfigurada(t *testing.T) {
	_, err := newUseCase(repoWith(group(1), false, 0), &mocks.GatewayMock{}).CreateCheckout(context.Background(), checkoutReq())
	if !errors.Is(err, domainerrors.ErrGatewayNotConfigured) {
		t.Fatalf("err = %v, se esperaba ErrGatewayNotConfigured", err)
	}
}

func TestCreateCheckout_RedirectInvalida(t *testing.T) {
	req := checkoutReq()
	req.RedirectURL = "javascript:alert(1)"
	_, err := newUseCase(repoWith(group(1), false, 0), enabledGateway()).CreateCheckout(context.Background(), req)
	if !errors.Is(err, domainerrors.ErrInvalidRedirectURL) {
		t.Fatalf("err = %v, se esperaba ErrInvalidRedirectURL", err)
	}
}
