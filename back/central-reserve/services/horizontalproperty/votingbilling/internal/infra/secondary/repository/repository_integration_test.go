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

func TestRepository_CoberturaContraLaBase(t *testing.T) {
	ctx := testkit.Ctx(t)
	database := testkit.DB(t)
	conn := database.Conn(ctx)
	repo := repository.New(database, testkit.Logger(t))
	hp := testkit.NewHorizontalProperty(t, database, []testkit.UnitSpec{{Number: "C-101", Coefficient: 100}})
	testkit.SetVotingBillingExempt(t, database, hp.BusinessID, false)

	// Administrador vinculado a la propiedad.
	user := models.User{Name: "Admin IT " + hp.Code, Email: "admin-" + hp.Code + "@example.com", Password: "x"}
	if err := conn.Create(&user).Error; err != nil {
		t.Fatalf("creando usuario: %v", err)
	}
	t.Cleanup(func() { conn.Unscoped().Delete(&models.User{}, user.ID) })
	bid := hp.BusinessID
	if err := conn.Create(&models.BusinessStaff{UserID: user.ID, BusinessID: &bid}).Error; err != nil {
		t.Fatalf("vinculando administrador: %v", err)
	}
	t.Cleanup(func() {
		conn.Unscoped().Where("user_id = ?", user.ID).Delete(&models.BusinessStaff{})
		conn.Unscoped().Where("user_id = ?", user.ID).Delete(&models.VotingBillingUserExemption{})
	})

	if ex, _ := repo.IsAdminExempt(ctx, bid); ex {
		t.Fatal("sin exención el administrador no debe estar exento")
	}
	if n, _ := repo.CountManagedProperties(ctx, user.ID); n != 1 {
		t.Fatalf("propiedades administradas = %d, se esperaba 1", n)
	}
	if err := repo.SetUserExempt(ctx, user.ID, true, "aliado", nil); err != nil {
		t.Fatalf("SetUserExempt: %v", err)
	}
	if ex, _ := repo.IsAdminExempt(ctx, bid); !ex {
		t.Fatal("con el administrador exento la propiedad debe quedar cubierta")
	}
	admins, err := repo.ListPropertyAdmins(ctx, bid)
	if err != nil || len(admins) != 1 || !admins[0].Exempt {
		t.Fatalf("ListPropertyAdmins = %+v, %v", admins, err)
	}

	// Membresía vigente que incluye la propiedad.
	now := time.Now()
	start, end := now.Add(-time.Hour), now.Add(48*time.Hour)
	m := models.Membership{PlanCode: "MONTH_1", MaxProperties: 1, Status: "ACTIVE", Source: "cortesia", StartsAt: &start, EndsAt: &end}
	if err := conn.Create(&m).Error; err != nil {
		t.Fatalf("creando membresía: %v", err)
	}
	if err := conn.Create(&models.MembershipProperty{MembershipID: m.ID, BusinessID: bid}).Error; err != nil {
		t.Fatalf("vinculando membresía: %v", err)
	}
	am, err := repo.ActiveMembership(ctx, bid, now)
	if err != nil || am == nil || am.PlanCode != "MONTH_1" {
		t.Fatalf("ActiveMembership = %+v, %v", am, err)
	}
	if am2, _ := repo.ActiveMembership(ctx, bid, end.Add(time.Minute)); am2 != nil {
		t.Fatal("después de vencer no debe haber membresía vigente")
	}

	// Compra aprobada dos veces: las fechas se crean una sola vez.
	p, err := repo.CreateDayPayment(ctx, &entities.DayPayment{BusinessID: bid, Reference: "DIA-IT-" + hp.Code, Source: "wompi",
		Dates: []string{"2099-01-02", "2099-01-03"}, AmountInCents: 10000000, Currency: "COP", Status: entities.StatusPending})
	if err != nil {
		t.Fatalf("CreateDayPayment: %v", err)
	}
	tx := entities.Transaction{ID: "tx-it", Reference: p.Reference, Status: entities.StatusApproved, AmountInCents: 10000000, Currency: "COP", PaymentMethodType: "PSE"}
	for i := 0; i < 2; i++ {
		if err := repo.ApproveDayPayment(ctx, p.ID, tx, now); err != nil {
			t.Fatalf("ApproveDayPayment #%d: %v", i+1, err)
		}
	}
	dates, err := repo.PurchasedDates(ctx, bid, "2099-01-01")
	if err != nil || len(dates) != 2 || dates[0] != "2099-01-02" || dates[1] != "2099-01-03" {
		t.Fatalf("PurchasedDates = %v, %v", dates, err)
	}

	// Cortesía con una fecha ya comprada: no falla y no duplica.
	if _, err := repo.CreateGrantedDays(ctx, &entities.DayPayment{BusinessID: bid, Reference: "CORTESIA-IT-" + hp.Code, Source: "cortesia",
		Dates: []string{"2099-01-03", "2099-01-04"}, Currency: "COP", Status: entities.StatusApproved}); err != nil {
		t.Fatalf("CreateGrantedDays: %v", err)
	}
	if dates, _ = repo.PurchasedDates(ctx, bid, "2099-01-01"); len(dates) != 3 {
		t.Fatalf("PurchasedDates tras la cortesía = %v, se esperaban 3", dates)
	}
}
