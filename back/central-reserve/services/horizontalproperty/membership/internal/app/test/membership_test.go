package app_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/membership/internal/app"
	"central_reserve/services/horizontalproperty/membership/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/membership/internal/domain/dtos"
	"central_reserve/services/horizontalproperty/membership/internal/domain/entities"
	domainerrors "central_reserve/services/horizontalproperty/membership/internal/domain/errors"
	"central_reserve/services/horizontalproperty/membership/internal/domain/ports"
)

const admin = uint(9)

func enabled() *mocks.GatewayMock { return &mocks.GatewayMock{EnabledFn: func() bool { return true }} }

func newUC(repo ports.IRepository, gw ports.IPaymentGateway) ports.IUseCase {
	return app.New(repo, gw, mocks.Logger{})
}

func managing(ids ...uint) *mocks.RepositoryMock {
	return &mocks.RepositoryMock{
		ManagedBusinessIDsFn: func(context.Context, uint) ([]uint, error) { return ids, nil },
		CreatePendingFn: func(_ context.Context, m *entities.Membership, p *entities.Payment) (*entities.Membership, *entities.Payment, error) {
			return m, p, nil
		},
	}
}

func checkout(plan string, ids ...uint) dtos.CheckoutRequest {
	return dtos.CheckoutRequest{UserID: admin, PlanCode: plan, BusinessIDs: ids, RedirectURL: "http://rupu.localhost:3005/x"}
}

func TestCreateCheckout_PlanDeAdministradoraCobraSuPrecio(t *testing.T) {
	out, err := newUC(managing(1, 2, 3, 4), enabled()).CreateCheckout(context.Background(), checkout("ADMIN_5", 1, 2, 3, 3))
	if err != nil {
		t.Fatalf("CreateCheckout: %v", err)
	}
	if out.Payment.AmountInCents != 450000*100 || out.Membership.Status != entities.MembershipPending || len(out.Membership.BusinessIDs) != 3 {
		t.Fatalf("checkout = %+v", out)
	}
	if out.Payment.Reference[:5] != "MEMB-" || *out.Membership.OwnerUserID != admin {
		t.Fatalf("referencia %q, dueño %v", out.Payment.Reference, out.Membership.OwnerUserID)
	}
}

func TestCreateCheckout_MasConjuntosQueElTope(t *testing.T) {
	_, err := newUC(managing(1, 2, 3, 4), enabled()).CreateCheckout(context.Background(), checkout("ADMIN_3", 1, 2, 3, 4))
	if !errors.Is(err, domainerrors.ErrInvalidProperties) {
		t.Fatalf("err = %v, se esperaba ErrInvalidProperties", err)
	}
}

func TestCreateCheckout_ConjuntoQueNoAdministra(t *testing.T) {
	_, err := newUC(managing(1, 2), enabled()).CreateCheckout(context.Background(), checkout("ADMIN_3", 1, 7))
	if !errors.Is(err, domainerrors.ErrPropertyNotManaged) {
		t.Fatalf("err = %v, se esperaba ErrPropertyNotManaged", err)
	}
}

func TestCreateCheckout_SuperAdminCompraParaCualquiera(t *testing.T) {
	req := checkout("MONTH_1", 7)
	req.IsSuperAdmin = true
	if _, err := newUC(managing(), enabled()).CreateCheckout(context.Background(), req); err != nil {
		t.Fatalf("super admin: %v", err)
	}
}

func TestCreateCheckout_PlanInexistenteOCustom(t *testing.T) {
	for _, plan := range []string{"NADA", entities.PlanCustom} {
		if _, err := newUC(managing(1), enabled()).CreateCheckout(context.Background(), checkout(plan, 1)); !errors.Is(err, domainerrors.ErrPlanNotFound) {
			t.Errorf("%s: err = %v", plan, err)
		}
	}
}

func payRepo(p *entities.Payment, m *entities.Membership, activated *[2]time.Time) *mocks.RepositoryMock {
	return &mocks.RepositoryMock{
		GetPaymentByReferenceFn: func(context.Context, string) (*entities.Payment, error) { return p, nil },
		GetMembershipFn:         func(context.Context, uint) (*entities.Membership, error) { return m, nil },
		ActivateFn: func(_ context.Context, _, _ uint, _ entities.Transaction, s, e time.Time) error {
			activated[0], activated[1] = s, e
			return nil
		},
	}
}

func pendingPayment() *entities.Payment {
	return &entities.Payment{ID: 2, MembershipID: 4, Reference: "MEMB-9-1", AmountInCents: 20000000, Currency: "COP", Status: entities.PaymentPending}
}

func TestApply_AprobadaActivaPorTreintaDias(t *testing.T) {
	var got [2]time.Time
	tx := entities.Transaction{ID: "t", Reference: "MEMB-9-1", Status: "APPROVED", AmountInCents: 20000000, Currency: "COP"}
	if err := newUC(payRepo(pendingPayment(), nil, &got), enabled()).ApplyGatewayTransaction(context.Background(), tx); err != nil {
		t.Fatalf("Apply: %v", err)
	}
	if got[1].Sub(got[0]) != 30*24*time.Hour {
		t.Fatalf("periodo = %v → %v, se esperaban 30 días", got[0], got[1])
	}
}

func TestApply_MontoDistintoNoActiva(t *testing.T) {
	var got [2]time.Time
	tx := entities.Transaction{Reference: "MEMB-9-1", Status: "APPROVED", AmountInCents: 100, Currency: "COP"}
	err := newUC(payRepo(pendingPayment(), nil, &got), enabled()).ApplyGatewayTransaction(context.Background(), tx)
	if !errors.Is(err, domainerrors.ErrTransactionMismatch) || !got[0].IsZero() {
		t.Fatalf("err = %v, activó = %v", err, !got[0].IsZero())
	}
}

func TestSync_SoloElDuenoConfirma(t *testing.T) {
	var got [2]time.Time
	other := uint(55)
	gw := enabled()
	gw.GetTransactionFn = func(context.Context, string) (*entities.Transaction, error) {
		return &entities.Transaction{Reference: "MEMB-9-1", Status: "APPROVED", AmountInCents: 20000000, Currency: "COP"}, nil
	}
	_, err := newUC(payRepo(pendingPayment(), &entities.Membership{ID: 4, OwnerUserID: &other}, &got), gw).SyncTransaction(context.Background(), dtos.SyncRequest{UserID: admin, TransactionID: "t"})
	if !errors.Is(err, domainerrors.ErrTransactionMismatch) || !got[0].IsZero() {
		t.Fatalf("err = %v, activó = %v", err, !got[0].IsZero())
	}
}

func TestGrant_CortesiaCustomConTopeLibre(t *testing.T) {
	var saved *entities.Membership
	repo := &mocks.RepositoryMock{CreateActiveFn: func(_ context.Context, m *entities.Membership) (*entities.Membership, error) {
		saved = m
		return m, nil
	}}
	ids := make([]uint, 25)
	for i := range ids {
		ids[i] = uint(i + 1)
	}
	_, err := newUC(repo, enabled()).Grant(context.Background(), dtos.GrantRequest{PlanCode: entities.PlanCustom, MaxProperties: 30, BusinessIDs: ids, Source: entities.SourceCourtesy, Notes: "aliado"})
	if err != nil {
		t.Fatalf("Grant: %v", err)
	}
	if saved.Status != entities.MembershipActive || saved.EndsAt == nil || len(saved.BusinessIDs) != 25 || saved.Source != entities.SourceCourtesy {
		t.Fatalf("membresía = %+v", saved)
	}
}

func TestGrant_OrigenInvalidoYTopeExcedido(t *testing.T) {
	uc := newUC(&mocks.RepositoryMock{}, enabled())
	if _, err := uc.Grant(context.Background(), dtos.GrantRequest{PlanCode: "MONTH_1", BusinessIDs: []uint{1}, Source: "wompi"}); !errors.Is(err, domainerrors.ErrInvalidSource) {
		t.Errorf("origen: err = %v", err)
	}
	if _, err := uc.Grant(context.Background(), dtos.GrantRequest{PlanCode: "MONTH_1", BusinessIDs: []uint{1, 2}, Source: "manual"}); !errors.Is(err, domainerrors.ErrInvalidProperties) {
		t.Errorf("tope: err = %v", err)
	}
}
