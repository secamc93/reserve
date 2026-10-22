//go:build integration

package repository_test

import (
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/entities"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/secondary/repository"
	"central_reserve/shared/testkit"
	"dbpostgres/app/infra/models"
)

func TestRepository_PagosYExencionContraLaBase(t *testing.T) {
	ctx := testkit.Ctx(t)
	database := testkit.DB(t)
	repo := repository.New(database, testkit.Logger(t))
	hp := testkit.NewHorizontalProperty(t, database, []testkit.UnitSpec{{Number: "R-101", Coefficient: 100}})

	group := models.VotingGroup{BusinessID: hp.BusinessID, Name: "Cobro repo " + hp.Code, VotingStartDate: time.Now(), VotingEndDate: time.Now().Add(time.Hour)}
	if err := database.Conn(ctx).Create(&group).Error; err != nil {
		t.Fatalf("creando grupo: %v", err)
	}

	// Exención: la propiedad de prueba nace exenta; SetExempt la cambia (upsert sobre business_id).
	if exempt, err := repo.IsExempt(ctx, hp.BusinessID); err != nil || !exempt {
		t.Fatalf("IsExempt inicial = %v, %v; se esperaba true", exempt, err)
	}
	if err := repo.SetExempt(ctx, hp.BusinessID, false, nil); err != nil {
		t.Fatalf("SetExempt: %v", err)
	}
	if exempt, _ := repo.IsExempt(ctx, hp.BusinessID); exempt {
		t.Fatal("después de SetExempt(false) sigue exenta")
	}

	g, err := repo.GetVotingGroup(ctx, group.ID)
	if err != nil || g == nil || g.BusinessID != hp.BusinessID {
		t.Fatalf("GetVotingGroup = %+v, %v", g, err)
	}

	p, err := repo.CreatePayment(ctx, &entities.Payment{BusinessID: hp.BusinessID, VotingGroupID: group.ID, Reference: "RUPU-IT-" + hp.Code,
		Provider: entities.ProviderWompi, Days: 1, AmountInCents: 5000000, Currency: "COP", Status: entities.StatusPending})
	if err != nil || p.ID == 0 {
		t.Fatalf("CreatePayment = %+v, %v", p, err)
	}
	if days, _ := repo.SumApprovedDays(ctx, group.ID); days != 0 {
		t.Fatalf("días aprobados con el pago pendiente = %d, se esperaba 0", days)
	}

	now := time.Now()
	approved := entities.Transaction{ID: "tx-it", Reference: p.Reference, Status: entities.StatusApproved, AmountInCents: 5000000, Currency: "COP", PaymentMethodType: "PSE"}
	if err := repo.UpdatePaymentFromTransaction(ctx, p.ID, approved, &now); err != nil {
		t.Fatalf("UpdatePaymentFromTransaction: %v", err)
	}
	if days, _ := repo.SumApprovedDays(ctx, group.ID); days != 1 {
		t.Fatalf("días aprobados = %d, se esperaba 1", days)
	}

	// Un evento tardío no puede bajar un pago aprobado (la condición está en la consulta).
	late := approved
	late.Status = entities.StatusDeclined
	if err := repo.UpdatePaymentFromTransaction(ctx, p.ID, late, nil); err != nil {
		t.Fatalf("UpdatePaymentFromTransaction tardío: %v", err)
	}
	got, err := repo.GetPaymentByReference(ctx, p.Reference)
	if err != nil || got == nil || got.Status != entities.StatusApproved || got.PaidAt == nil || got.PaymentMethodType != "PSE" {
		t.Fatalf("pago después del evento tardío = %+v, %v", got, err)
	}

	list, err := repo.ListPaymentsByGroup(ctx, group.ID)
	if err != nil || len(list) != 1 {
		t.Fatalf("ListPaymentsByGroup = %d pagos, %v", len(list), err)
	}
}
