package app_test

import (
	"context"
	"errors"
	"testing"

	domainerrors "central_reserve/services/horizontalproperty/votingbilling/internal/domain/errors"
)

func TestGetStatus_PagoParcialDebeLosDiasQueFaltan(t *testing.T) {
	uc := newUseCase(repoWith(group(3), false, 1), enabledGateway())

	st, err := uc.GetStatus(context.Background(), businessID, groupID)
	if err != nil {
		t.Fatalf("GetStatus: %v", err)
	}
	if st.RequiredDays != 3 || st.PaidDays != 1 || st.DueDays != 2 {
		t.Fatalf("días requeridos/pagados/pendientes = %d/%d/%d, se esperaba 3/1/2", st.RequiredDays, st.PaidDays, st.DueDays)
	}
	if st.AmountDueInCents != 2*price*100 {
		t.Fatalf("monto pendiente = %d, se esperaba %d", st.AmountDueInCents, 2*price*100)
	}
	if st.Paid {
		t.Fatal("con días pendientes no puede estar pagado")
	}
}

func TestGetStatus_PropiedadExentaNoDebeNada(t *testing.T) {
	uc := newUseCase(repoWith(group(2), true, 0), enabledGateway())

	st, err := uc.GetStatus(context.Background(), businessID, groupID)
	if err != nil {
		t.Fatalf("GetStatus: %v", err)
	}
	if !st.Exempt || !st.Paid || st.DueDays != 0 || st.AmountDueInCents != 0 {
		t.Fatalf("exenta: exempt=%v paid=%v due=%d amount=%d", st.Exempt, st.Paid, st.DueDays, st.AmountDueInCents)
	}
}

func TestGetStatus_GrupoDeOtraPropiedadNoExiste(t *testing.T) {
	ajeno := group(1)
	ajeno.BusinessID = 99
	uc := newUseCase(repoWith(ajeno, false, 0), enabledGateway())

	_, err := uc.GetStatus(context.Background(), businessID, groupID)
	if !errors.Is(err, domainerrors.ErrVotingGroupNotFound) {
		t.Fatalf("err = %v, se esperaba ErrVotingGroupNotFound", err)
	}
}

func TestGetStatus_PrecioPorDefectoSiNoSeConfigura(t *testing.T) {
	uc := newUseCaseWithPrice(repoWith(group(1), false, 0), 0)

	st, err := uc.GetStatus(context.Background(), businessID, groupID)
	if err != nil {
		t.Fatalf("GetStatus: %v", err)
	}
	if st.PricePerDayCOP != 50000 || st.AmountDueInCents != 5000000 {
		t.Fatalf("precio=%d monto=%d, se esperaba 50000 y 5000000", st.PricePerDayCOP, st.AmountDueInCents)
	}
}

