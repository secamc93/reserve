package app_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/votingbilling/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"
	domainerrors "central_reserve/services/horizontalproperty/votingbilling/internal/domain/errors"
)

func pending() *entities.DayPayment {
	return &entities.DayPayment{ID: 5, BusinessID: businessID, Reference: "DIA-7-1", Dates: []string{"2026-10-25"},
		AmountInCents: 5000000, Currency: "COP", Status: entities.StatusPending}
}

func approvedTx() entities.Transaction {
	return entities.Transaction{ID: "tx-1", Reference: "DIA-7-1", Status: entities.StatusApproved, AmountInCents: 5000000, Currency: "COP", PaymentMethodType: "NEQUI"}
}

type calls struct{ approved, updated bool }

func repoWith(p *entities.DayPayment, c *calls) *mocks.RepositoryMock {
	return &mocks.RepositoryMock{
		GetDayPaymentByReferenceFn: func(_ context.Context, ref string) (*entities.DayPayment, error) {
			if p != nil && ref == p.Reference {
				return p, nil
			}
			return nil, nil
		},
		ApproveDayPaymentFn:      func(context.Context, uint, entities.Transaction, time.Time) error { c.approved = true; return nil },
		UpdateDayPaymentStatusFn: func(context.Context, uint, entities.Transaction) error { c.updated = true; return nil },
	}
}

func TestApplyGatewayTransaction_AprobadaCreaLosDias(t *testing.T) {
	var c calls
	if err := newUseCase(repoWith(pending(), &c), enabled()).ApplyGatewayTransaction(context.Background(), approvedTx()); err != nil {
		t.Fatalf("Apply: %v", err)
	}
	if !c.approved || c.updated {
		t.Fatalf("llamadas = %+v, se esperaba aprobar", c)
	}
}

func TestApplyGatewayTransaction_RechazadaSoloGuardaElEstado(t *testing.T) {
	var c calls
	tx := approvedTx()
	tx.Status = entities.StatusDeclined
	if err := newUseCase(repoWith(pending(), &c), enabled()).ApplyGatewayTransaction(context.Background(), tx); err != nil {
		t.Fatalf("Apply: %v", err)
	}
	if c.approved || !c.updated {
		t.Fatalf("llamadas = %+v, se esperaba solo actualizar el estado", c)
	}
}

func TestApplyGatewayTransaction_MontoDistintoNoAprueba(t *testing.T) {
	var c calls
	tx := approvedTx()
	tx.AmountInCents = 100
	err := newUseCase(repoWith(pending(), &c), enabled()).ApplyGatewayTransaction(context.Background(), tx)
	if !errors.Is(err, domainerrors.ErrTransactionMismatch) || c.approved {
		t.Fatalf("err = %v, aprobado = %v", err, c.approved)
	}
}

func TestApplyGatewayTransaction_PagoAprobadoNoCambia(t *testing.T) {
	var c calls
	p := pending()
	p.Status = entities.StatusApproved
	tx := approvedTx()
	tx.Status = entities.StatusDeclined
	if err := newUseCase(repoWith(p, &c), enabled()).ApplyGatewayTransaction(context.Background(), tx); err != nil || c.approved || c.updated {
		t.Fatalf("err = %v, llamadas = %+v; un pago aprobado no cambia", err, c)
	}
}

func TestSyncTransaction_NoAceptaCompraDeOtraPropiedad(t *testing.T) {
	var c calls
	p := pending()
	p.BusinessID = 99
	gw := enabled()
	gw.GetTransactionFn = func(context.Context, string) (*entities.Transaction, error) { tx := approvedTx(); return &tx, nil }
	if _, err := newUseCase(repoWith(p, &c), gw).SyncTransaction(context.Background(), businessID, "tx-1", now); !errors.Is(err, domainerrors.ErrTransactionMismatch) || c.approved {
		t.Fatalf("err = %v, aprobado = %v", err, c.approved)
	}
}
