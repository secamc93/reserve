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

func pendingPayment() *entities.Payment {
	return &entities.Payment{ID: 5, BusinessID: businessID, VotingGroupID: groupID, Reference: "RUPU-42-1", Days: 1,
		AmountInCents: 5000000, Currency: "COP", Status: entities.StatusPending, Provider: entities.ProviderWompi}
}

func approvedTx() entities.Transaction {
	return entities.Transaction{ID: "tx-1", Reference: "RUPU-42-1", Status: entities.StatusApproved, AmountInCents: 5000000, Currency: "COP", PaymentMethodType: "PSE"}
}

// eventGateway devuelve siempre la transacción tx como evento válido.
func eventGateway(tx entities.Transaction) *mocks.GatewayMock {
	return &mocks.GatewayMock{
		EnabledFn:        func() bool { return true },
		ParseEventFn:     func([]byte) (*entities.Transaction, error) { return &tx, nil },
		GetTransactionFn: func(context.Context, string) (*entities.Transaction, error) { return &tx, nil },
	}
}

type updateCall struct {
	called bool
	tx     entities.Transaction
	paidAt *time.Time
}

func repoWithPayment(p *entities.Payment, call *updateCall) *mocks.RepositoryMock {
	repo := repoWith(group(1), false, 0)
	repo.GetPaymentByReferenceFn = func(_ context.Context, ref string) (*entities.Payment, error) {
		if p != nil && ref == p.Reference {
			return p, nil
		}
		return nil, nil
	}
	repo.UpdatePaymentFromTransactionFn = func(_ context.Context, _ uint, tx entities.Transaction, paidAt *time.Time) error {
		*call = updateCall{called: true, tx: tx, paidAt: paidAt}
		return nil
	}
	return repo
}

func TestHandleGatewayEvent_AprobadaMarcaElPagoConFecha(t *testing.T) {
	var call updateCall
	err := newUseCase(repoWithPayment(pendingPayment(), &call), eventGateway(approvedTx())).HandleGatewayEvent(context.Background(), []byte("{}"))
	if err != nil {
		t.Fatalf("HandleGatewayEvent: %v", err)
	}
	if !call.called || call.tx.Status != entities.StatusApproved || call.paidAt == nil || call.tx.PaymentMethodType != "PSE" {
		t.Fatalf("actualización = %+v, se esperaba APPROVED con fecha y medio de pago", call)
	}
}

func TestHandleGatewayEvent_RechazadaNoTieneFechaDePago(t *testing.T) {
	var call updateCall
	tx := approvedTx()
	tx.Status = entities.StatusDeclined
	if err := newUseCase(repoWithPayment(pendingPayment(), &call), eventGateway(tx)).HandleGatewayEvent(context.Background(), nil); err != nil {
		t.Fatalf("HandleGatewayEvent: %v", err)
	}
	if !call.called || call.tx.Status != entities.StatusDeclined || call.paidAt != nil {
		t.Fatalf("actualización = %+v, se esperaba DECLINED sin fecha de pago", call)
	}
}

func TestHandleGatewayEvent_MontoDistintoNoApruebaElPago(t *testing.T) {
	var call updateCall
	tx := approvedTx()
	tx.AmountInCents = 100 // alguien pagó $1 con la referencia del pago
	err := newUseCase(repoWithPayment(pendingPayment(), &call), eventGateway(tx)).HandleGatewayEvent(context.Background(), nil)
	if !errors.Is(err, domainerrors.ErrTransactionMismatch) {
		t.Fatalf("err = %v, se esperaba ErrTransactionMismatch", err)
	}
	if call.called {
		t.Fatal("no debía actualizar el pago")
	}
}

func TestHandleGatewayEvent_EventoRepetidoNoCambiaUnPagoAprobado(t *testing.T) {
	var call updateCall
	p := pendingPayment()
	p.Status = entities.StatusApproved
	tx := approvedTx()
	tx.Status = entities.StatusDeclined // un evento viejo que llega tarde
	if err := newUseCase(repoWithPayment(p, &call), eventGateway(tx)).HandleGatewayEvent(context.Background(), nil); err != nil {
		t.Fatalf("HandleGatewayEvent: %v", err)
	}
	if call.called {
		t.Fatal("un pago aprobado no debía cambiar")
	}
}

func TestHandleGatewayEvent_ReferenciaDesconocida(t *testing.T) {
	var call updateCall
	err := newUseCase(repoWithPayment(nil, &call), eventGateway(approvedTx())).HandleGatewayEvent(context.Background(), nil)
	if !errors.Is(err, domainerrors.ErrPaymentNotFound) {
		t.Fatalf("err = %v, se esperaba ErrPaymentNotFound", err)
	}
}

func TestHandleGatewayEvent_FirmaInvalidaNoTocaNada(t *testing.T) {
	var call updateCall
	gw := &mocks.GatewayMock{ParseEventFn: func([]byte) (*entities.Transaction, error) { return nil, domainerrors.ErrInvalidEventSignature }}
	err := newUseCase(repoWithPayment(pendingPayment(), &call), gw).HandleGatewayEvent(context.Background(), nil)
	if !errors.Is(err, domainerrors.ErrInvalidEventSignature) || call.called {
		t.Fatalf("err = %v, actualizó = %v; se esperaba firma inválida sin cambios", err, call.called)
	}
}

func TestSyncTransaction_NoAceptaUnPagoDeOtroGrupo(t *testing.T) {
	var call updateCall
	p := pendingPayment()
	p.VotingGroupID = 77
	_, err := newUseCase(repoWithPayment(p, &call), eventGateway(approvedTx())).SyncTransaction(context.Background(), businessID, groupID, "tx-1")
	if !errors.Is(err, domainerrors.ErrTransactionMismatch) || call.called {
		t.Fatalf("err = %v, actualizó = %v; se esperaba rechazo sin cambios", err, call.called)
	}
}
