//go:build integration

package repository_test

import (
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/shared/testkit"
	"dbpostgres/app/infra/models"
)

// IsVotingPaymentPending contra la base real: una propiedad que paga debe sus días hasta que los
// pagos aprobados los cubren; una exenta no debe nada.
func TestIsVotingPaymentPending_CubrePorDiasPagadosOExencion(t *testing.T) {
	repo, database := nuevoRepo(t)
	ctx := testkit.Ctx(t)
	hp := testkit.NewHorizontalProperty(t, database, []testkit.UnitSpec{{Number: "P-101", Coefficient: 100}})
	testkit.SetVotingBillingExempt(t, database, hp.BusinessID, false)

	cot := time.FixedZone("COT", -5*60*60)
	start := time.Date(2026, 3, 14, 8, 0, 0, 0, cot)
	// 14 y 15 de marzo en Colombia: 2 días de votación.
	g, err := repo.CreateVotingGroup(ctx, &domain.VotingGroup{BusinessID: hp.BusinessID, Name: "Cobro " + hp.Code,
		VotingStartDate: start, VotingEndDate: start.Add(26 * time.Hour)})
	if err != nil {
		t.Fatalf("CreateVotingGroup: %v", err)
	}
	v, err := repo.CreateVoting(ctx, &domain.Voting{VotingGroupID: g.ID, Title: "Presupuesto", Description: "IT", VotingType: "simple", DisplayOrder: 1})
	if err != nil {
		t.Fatalf("CreateVoting: %v", err)
	}

	pending := func(want bool, cuando string) {
		t.Helper()
		got, err := repo.IsVotingPaymentPending(ctx, v.ID)
		if err != nil {
			t.Fatalf("IsVotingPaymentPending (%s): %v", cuando, err)
		}
		if got != want {
			t.Fatalf("%s: pendiente = %v, se esperaba %v", cuando, got, want)
		}
	}
	pay := func(days int, status, ref string) {
		t.Helper()
		p := models.VotingGroupPayment{BusinessID: hp.BusinessID, VotingGroupID: g.ID, Reference: ref + "-" + hp.Code,
			Provider: "wompi", Days: days, AmountInCents: int64(days) * 5000000, Currency: "COP", Status: status}
		if err := database.Conn(ctx).Create(&p).Error; err != nil {
			t.Fatalf("creando pago: %v", err)
		}
	}

	pending(true, "sin pagos")
	pay(2, "DECLINED", "rechazado")
	pending(true, "con un pago rechazado")
	pay(1, "APPROVED", "uno")
	pending(true, "con 1 de 2 días pagados")
	pay(1, "APPROVED", "dos")
	pending(false, "con los 2 días pagados")

	testkit.SetVotingBillingExempt(t, database, hp.BusinessID, true)
	g2, err := repo.CreateVotingGroup(ctx, &domain.VotingGroup{BusinessID: hp.BusinessID, Name: "Exenta " + hp.Code,
		VotingStartDate: start, VotingEndDate: start.Add(time.Hour)})
	if err != nil {
		t.Fatalf("CreateVotingGroup exenta: %v", err)
	}
	v2, err := repo.CreateVoting(ctx, &domain.Voting{VotingGroupID: g2.ID, Title: "Exenta", Description: "IT", VotingType: "simple", DisplayOrder: 1})
	if err != nil {
		t.Fatalf("CreateVoting exenta: %v", err)
	}
	got, err := repo.IsVotingPaymentPending(ctx, v2.ID)
	if err != nil || got {
		t.Fatalf("propiedad exenta: pendiente = %v, err = %v; se esperaba false", got, err)
	}
}
