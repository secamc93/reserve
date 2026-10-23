//go:build integration

package repository_test

import (
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/shared/testkit"
	"dbpostgres/app/infra/models"
)

// GetVotingCoverage contra la base real: el día comprado cubre solo ese día; la membresía, sus
// días vigentes; la exención del administrador, todo.
func TestGetVotingCoverage_DiaMembresiaYExencion(t *testing.T) {
	repo, database := nuevoRepo(t)
	ctx := testkit.Ctx(t)
	conn := database.Conn(ctx)
	hp := testkit.NewHorizontalProperty(t, database, []testkit.UnitSpec{{Number: "P-101", Coefficient: 100}})
	testkit.SetVotingBillingExempt(t, database, hp.BusinessID, false)

	g, err := repo.CreateVotingGroup(ctx, &domain.VotingGroup{BusinessID: hp.BusinessID, Name: "Cobertura " + hp.Code,
		VotingStartDate: time.Now(), VotingEndDate: time.Now().Add(time.Hour)})
	if err != nil {
		t.Fatalf("CreateVotingGroup: %v", err)
	}
	v, err := repo.CreateVoting(ctx, &domain.Voting{VotingGroupID: g.ID, Title: "Presupuesto", Description: "IT", VotingType: "simple", DisplayOrder: 1})
	if err != nil {
		t.Fatalf("CreateVoting: %v", err)
	}
	cot := time.FixedZone("COT", -5*60*60)
	day := time.Date(2099, 3, 14, 10, 0, 0, 0, cot)
	covered := func(at time.Time, cuando string) bool {
		t.Helper()
		c, err := repo.GetVotingCoverage(ctx, v.ID, at)
		if err != nil {
			t.Fatalf("GetVotingCoverage (%s): %v", cuando, err)
		}
		return c.Covered()
	}

	if covered(day, "sin nada") {
		t.Fatal("sin día, membresía ni exención no debe estar cubierto")
	}

	pay := models.VotingDayPayment{BusinessID: hp.BusinessID, Reference: "DIA-COV-" + hp.Code, Source: "wompi", Dates: "2099-03-14", Days: 1, AmountInCents: 5000000, Currency: "COP", Status: "APPROVED"}
	if err := conn.Create(&pay).Error; err != nil {
		t.Fatalf("creando compra: %v", err)
	}
	if err := conn.Create(&models.VotingDay{BusinessID: hp.BusinessID, VotingDate: time.Date(2099, 3, 14, 0, 0, 0, 0, cot), PaymentID: pay.ID}).Error; err != nil {
		t.Fatalf("creando día: %v", err)
	}
	if !covered(day, "día comprado") || !covered(time.Date(2099, 3, 14, 23, 30, 0, 0, cot), "noche del día comprado") {
		t.Fatal("el día comprado debe cubrir todo ese día en Colombia")
	}
	if covered(time.Date(2099, 3, 15, 0, 30, 0, 0, cot), "día siguiente") {
		t.Fatal("el día comprado no cubre el día siguiente")
	}

	start, end := day.AddDate(0, 0, 1), day.AddDate(0, 0, 31)
	m := models.Membership{PlanCode: "MONTH_1", MaxProperties: 1, Status: "ACTIVE", Source: "cortesia", StartsAt: &start, EndsAt: &end}
	if err := conn.Create(&m).Error; err != nil {
		t.Fatalf("creando membresía: %v", err)
	}
	if err := conn.Create(&models.MembershipProperty{MembershipID: m.ID, BusinessID: hp.BusinessID}).Error; err != nil {
		t.Fatalf("vinculando membresía: %v", err)
	}
	if !covered(day.AddDate(0, 0, 10), "dentro de la membresía") || covered(day.AddDate(0, 0, 40), "después de la membresía") {
		t.Fatal("la membresía cubre solo su periodo")
	}

	user := models.User{Name: "Admin cobertura " + hp.Code, Email: "cov-" + hp.Code + "@example.com", Password: "x"}
	if err := conn.Create(&user).Error; err != nil {
		t.Fatalf("creando usuario: %v", err)
	}
	bid := hp.BusinessID
	conn.Create(&models.BusinessStaff{UserID: user.ID, BusinessID: &bid})
	conn.Create(&models.VotingBillingUserExemption{UserID: user.ID, Exempt: true})
	t.Cleanup(func() {
		conn.Unscoped().Where("user_id = ?", user.ID).Delete(&models.VotingBillingUserExemption{})
		conn.Unscoped().Where("user_id = ?", user.ID).Delete(&models.BusinessStaff{})
		conn.Unscoped().Delete(&models.User{}, user.ID)
	})
	if !covered(day.AddDate(0, 0, 40), "administradora exenta") {
		t.Fatal("con la administradora exenta la propiedad debe estar cubierta siempre")
	}
}
