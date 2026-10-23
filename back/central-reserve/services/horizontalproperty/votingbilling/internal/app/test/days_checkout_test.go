package app_test

import (
	"context"
	"errors"
	"reflect"
	"testing"

	"central_reserve/services/horizontalproperty/votingbilling/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/dtos"
	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"
	domainerrors "central_reserve/services/horizontalproperty/votingbilling/internal/domain/errors"
)

func checkoutReq(dates ...string) dtos.DaysCheckoutRequest {
	return dtos.DaysCheckoutRequest{BusinessID: businessID, Dates: dates, RedirectURL: "http://rupu.localhost:3005/x", Now: now}
}

func TestCreateDaysCheckout_CobraSoloLasFechasSinCubrir(t *testing.T) {
	var saved *entities.DayPayment
	repo := &mocks.RepositoryMock{
		PurchasedDatesFn: func(context.Context, uint, string) ([]string, error) { return []string{"2026-10-24"}, nil },
		CreateDayPaymentFn: func(_ context.Context, p *entities.DayPayment) (*entities.DayPayment, error) {
			saved = p
			return p, nil
		},
	}
	out, err := newUseCase(repo, enabled()).CreateDaysCheckout(context.Background(), checkoutReq("2026-10-25", "2026-10-24", "2026-10-25"))
	if err != nil {
		t.Fatalf("CreateDaysCheckout: %v", err)
	}
	if !reflect.DeepEqual(saved.Dates, []string{"2026-10-25"}) || saved.AmountInCents != price*100 || saved.Status != entities.StatusPending {
		t.Fatalf("pago = %+v, se esperaba solo el 25 a $50.000 pendiente", saved)
	}
	if out.CheckoutURL == "" || saved.Reference[:4] != "DIA-" {
		t.Fatalf("referencia %q / url %q", saved.Reference, out.CheckoutURL)
	}
}

func TestCreateDaysCheckout_FechasInvalidas(t *testing.T) {
	uc := newUseCase(&mocks.RepositoryMock{}, enabled())
	many := make([]string, 32)
	for i := range many {
		many[i] = "2026-11-" + []string{"01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"}[i%30]
	}
	for name, dates := range map[string][]string{
		"pasada":    {"2026-10-21"},
		"formato":   {"24/10/2026"},
		"vacía":     {},
		"más de 31": append(many[:30:30], "2026-12-01", "2026-12-02"),
	} {
		if _, err := uc.CreateDaysCheckout(context.Background(), checkoutReq(dates...)); !errors.Is(err, domainerrors.ErrInvalidDates) {
			t.Errorf("%s: err = %v, se esperaba ErrInvalidDates", name, err)
		}
	}
}

func TestCreateDaysCheckout_HoySePuedeComprar(t *testing.T) {
	repo := &mocks.RepositoryMock{CreateDayPaymentFn: func(_ context.Context, p *entities.DayPayment) (*entities.DayPayment, error) { return p, nil }}
	if _, err := newUseCase(repo, enabled()).CreateDaysCheckout(context.Background(), checkoutReq("2026-10-22")); err != nil {
		t.Fatalf("comprar el día de hoy: %v", err)
	}
}

func TestCreateDaysCheckout_TodoCubiertoNoCreaPago(t *testing.T) {
	repo := &mocks.RepositoryMock{
		IsPropertyExemptFn: func(context.Context, uint) (bool, error) { return true, nil },
		CreateDayPaymentFn: func(context.Context, *entities.DayPayment) (*entities.DayPayment, error) {
			t.Fatal("no debía crear pago")
			return nil, nil
		},
	}
	if _, err := newUseCase(repo, enabled()).CreateDaysCheckout(context.Background(), checkoutReq("2026-10-25")); !errors.Is(err, domainerrors.ErrNothingDue) {
		t.Fatalf("err = %v, se esperaba ErrNothingDue", err)
	}
}

func TestCreateDaysCheckout_SinPasarela(t *testing.T) {
	if _, err := newUseCase(&mocks.RepositoryMock{}, &mocks.GatewayMock{}).CreateDaysCheckout(context.Background(), checkoutReq("2026-10-25")); !errors.Is(err, domainerrors.ErrGatewayNotConfigured) {
		t.Fatalf("err = %v", err)
	}
}
