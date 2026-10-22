package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/dtos"
	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"
	domainerrors "central_reserve/services/horizontalproperty/votingbilling/internal/domain/errors"
)

func TestRegisterManualPayment_ApruebaLosDiasPendientes(t *testing.T) {
	repo := repoWith(group(2), false, 1)
	var saved *entities.Payment
	repo.CreatePaymentFn = func(_ context.Context, p *entities.Payment) (*entities.Payment, error) { saved = p; return p, nil }

	_, err := newUseCase(repo, enabledGateway()).RegisterManualPayment(context.Background(), dtos.ManualPaymentRequest{
		BusinessID: businessID, VotingGroupID: groupID, Notes: "Nequi 22-oct"})
	if err != nil {
		t.Fatalf("RegisterManualPayment: %v", err)
	}
	if saved.Status != entities.StatusApproved || saved.Provider != entities.ProviderManual || saved.PaidAt == nil {
		t.Fatalf("pago = %+v, se esperaba manual aprobado con fecha", saved)
	}
	if saved.Days != 1 || saved.AmountInCents != price*100 || saved.Notes != "Nequi 22-oct" {
		t.Fatalf("pago = %d días, %d centavos, notas %q", saved.Days, saved.AmountInCents, saved.Notes)
	}
}

func TestRegisterManualPayment_NadaPendiente(t *testing.T) {
	_, err := newUseCase(repoWith(group(1), true, 0), enabledGateway()).RegisterManualPayment(context.Background(), dtos.ManualPaymentRequest{
		BusinessID: businessID, VotingGroupID: groupID})
	if !errors.Is(err, domainerrors.ErrNothingDue) {
		t.Fatalf("err = %v, se esperaba ErrNothingDue", err)
	}
}

func TestSetExemption_GuardaLaPropiedadYElValor(t *testing.T) {
	repo := repoWith(group(1), false, 0)
	var gotBusiness uint
	var gotExempt bool
	repo.SetExemptFn = func(_ context.Context, b uint, e bool, _ *uint) error { gotBusiness, gotExempt = b, e; return nil }

	if err := newUseCase(repo, enabledGateway()).SetExemption(context.Background(), dtos.ExemptionRequest{BusinessID: businessID, Exempt: true}); err != nil {
		t.Fatalf("SetExemption: %v", err)
	}
	if gotBusiness != businessID || !gotExempt {
		t.Fatalf("guardó business=%d exempt=%v", gotBusiness, gotExempt)
	}
}
