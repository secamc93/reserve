//go:build integration

package repository_test

import (
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/membership/internal/domain/entities"
	"central_reserve/services/horizontalproperty/membership/internal/infra/secondary/repository"
	"central_reserve/shared/testkit"
	"dbpostgres/app/infra/models"
)

func TestRepository_MembresiaPendienteYActivacion(t *testing.T) {
	ctx := testkit.Ctx(t)
	database := testkit.DB(t)
	conn := database.Conn(ctx)
	repo := repository.New(database, testkit.Logger(t))
	a := testkit.NewHorizontalProperty(t, database, []testkit.UnitSpec{{Number: "M-101", Coefficient: 100}})
	b := testkit.NewHorizontalProperty(t, database, []testkit.UnitSpec{{Number: "M-201", Coefficient: 100}})

	user := models.User{Name: "Administradora IT " + a.Code, Email: "adm-" + a.Code + "@example.com", Password: "x"}
	if err := conn.Create(&user).Error; err != nil {
		t.Fatalf("creando usuario: %v", err)
	}
	t.Cleanup(func() {
		conn.Unscoped().Where("user_id = ?", user.ID).Delete(&models.BusinessStaff{})
		conn.Unscoped().Delete(&models.User{}, user.ID)
	})
	for _, id := range []uint{a.BusinessID, b.BusinessID} {
		bid := id
		if err := conn.Create(&models.BusinessStaff{UserID: user.ID, BusinessID: &bid}).Error; err != nil {
			t.Fatalf("vinculando: %v", err)
		}
	}
	managed, err := repo.ManagedBusinessIDs(ctx, user.ID)
	if err != nil || len(managed) != 2 {
		t.Fatalf("ManagedBusinessIDs = %v, %v", managed, err)
	}

	owner := user.ID
	m, p, err := repo.CreatePending(ctx,
		&entities.Membership{PlanCode: "ADMIN_3", MaxProperties: 3, OwnerUserID: &owner, Status: entities.MembershipPending, Source: entities.SourceWompi, BusinessIDs: []uint{a.BusinessID, b.BusinessID}},
		&entities.Payment{Reference: "MEMB-IT-" + a.Code, AmountInCents: 30000000, Currency: "COP", Status: entities.PaymentPending})
	if err != nil || m.ID == 0 || p.MembershipID != m.ID {
		t.Fatalf("CreatePending = %+v / %+v, %v", m, p, err)
	}
	if mine, _ := repo.ListByOwner(ctx, user.ID, 20); len(mine) != 0 {
		t.Fatal("una membresía pendiente no se lista")
	}

	start := time.Now()
	end := start.Add(30 * 24 * time.Hour)
	tx := entities.Transaction{ID: "tx-it", Reference: p.Reference, Status: "APPROVED", AmountInCents: 30000000, Currency: "COP", PaymentMethodType: "CARD"}
	if err := repo.Activate(ctx, p.ID, m.ID, tx, start, end); err != nil {
		t.Fatalf("Activate: %v", err)
	}
	// Un segundo aviso no cambia el periodo.
	if err := repo.Activate(ctx, p.ID, m.ID, tx, start.Add(time.Hour), end.Add(time.Hour)); err != nil {
		t.Fatalf("Activate repetido: %v", err)
	}
	got, err := repo.GetMembership(ctx, m.ID)
	if err != nil || got.Status != entities.MembershipActive || got.EndsAt == nil || got.EndsAt.Sub(end).Abs() > time.Second || len(got.BusinessIDs) != 2 {
		t.Fatalf("membresía = %+v, %v", got, err)
	}
	if list, _ := repo.ListByBusiness(ctx, b.BusinessID, 20); len(list) != 1 {
		t.Fatalf("ListByBusiness = %d, se esperaba 1", len(list))
	}
}
