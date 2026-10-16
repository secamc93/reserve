//go:build integration

package app_test

import (
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/resident/internal/app"
	"central_reserve/services/horizontalproperty/resident/internal/domain"
	"central_reserve/services/horizontalproperty/resident/internal/infra/secondary/repository"
	"central_reserve/shared/testkit"
	"dbpostgres/app/infra/models"
)

// Resumen del residente (otros residentes de la unidad, paquetes pendientes, votos del último
// grupo) y filtros nuevos del listado (búsqueda general, bloque, sin correo, "desde").
func TestResidentOverviewAndListFilters_Integration(t *testing.T) {
	database := testkit.DB(t)
	ctx := testkit.Ctx(t)
	conn := database.Conn(ctx)

	hp := testkit.NewHorizontalProperty(t, database, []testkit.UnitSpec{
		{Number: "126", Coefficient: 60, ResidentName: "Ana Casa"},
		{Number: "7", Coefficient: 40, ResidentName: "Luis Local"},
	})
	unitA, unitB := hp.UnitID(0), hp.UnitID(1)
	ana, luis := hp.ResidentIDByUnit[unitA], hp.ResidentIDByUnit[unitB]
	must := func(err error) {
		t.Helper()
		if err != nil {
			t.Fatal(err)
		}
	}
	must(conn.Model(&models.PropertyUnit{}).Where("id = ?", unitA).Update("block", "Casa").Error)
	must(conn.Model(&models.PropertyUnit{}).Where("id = ?", unitB).Update("block", "Local").Error)
	must(conn.Model(&models.Resident{}).Where("id = ?", luis).Update("email", "").Error)
	moveIn := time.Date(2021, 3, 1, 0, 0, 0, 0, time.UTC)
	must(conn.Model(&models.ResidentUnit{}).Where("resident_id = ?", ana).Update("move_in_date", moveIn).Error)

	// Un familiar en la unidad de Ana
	var familyType models.ResidentType
	must(conn.Where("code = ?", "owner").First(&familyType).Error)
	pepe := models.Resident{BusinessID: hp.BusinessID, ResidentTypeID: familyType.ID, Name: "Pepe Casa", Email: "pepe-" + hp.Code + "@rupu.test", IsActive: true}
	must(conn.Create(&pepe).Error)
	must(conn.Create(&models.ResidentUnit{BusinessID: hp.BusinessID, ResidentID: pepe.ID, PropertyUnitID: unitA}).Error)

	// Paquetes: uno pendiente y uno entregado
	var received, delivered models.PackageStatus
	must(conn.Where("code = ?", "received").First(&received).Error)
	must(conn.Where("code = ?", "delivered").First(&delivered).Error)
	now := time.Now()
	must(conn.Create(&models.Package{BusinessID: hp.BusinessID, PropertyUnitID: unitA, PackageStatusID: received.ID, Carrier: "Servientrega", ReceivedAt: &now}).Error)
	must(conn.Create(&models.Package{BusinessID: hp.BusinessID, PropertyUnitID: unitA, PackageStatusID: delivered.ID, Carrier: "DHL", DeliveredAt: &now}).Error)

	// Último grupo de votación con 2 votaciones; la unidad de Ana votó en 1
	group := models.VotingGroup{BusinessID: hp.BusinessID, Name: "Asamblea IT", VotingStartDate: now, VotingEndDate: now.Add(time.Hour), IsActive: true}
	must(conn.Create(&group).Error)
	v1 := models.Voting{VotingGroupID: group.ID, Title: "Presupuesto", Description: "x", VotingType: "simple", IsActive: true}
	v2 := models.Voting{VotingGroupID: group.ID, Title: "Obras", Description: "x", VotingType: "simple", IsActive: true}
	must(conn.Create(&v1).Error)
	must(conn.Create(&v2).Error)
	opt := models.VotingOption{VotingID: v1.ID, OptionText: "Sí", OptionCode: "yes", Color: "#000000"}
	must(conn.Create(&opt).Error)
	must(conn.Create(&models.Vote{VotingID: v1.ID, PropertyUnitID: unitA, VotingOptionID: opt.ID, VotedAt: now}).Error)

	logger := testkit.Logger(t)
	uc := app.New(repository.New(database, logger), logger)

	t.Run("resumen de Ana", func(t *testing.T) {
		o, err := uc.GetResidentOverview(ctx, hp.BusinessID, ana)
		if err != nil {
			t.Fatalf("GetResidentOverview: %v", err)
		}
		if o.Stats.PackagesPending != 1 || o.Stats.VotesCast != 1 || o.Stats.VotesTotal != 2 {
			t.Fatalf("cifras inesperadas: %+v", o.Stats)
		}
		if len(o.Housemates) != 1 || o.Housemates[0].Name != "Pepe Casa" {
			t.Fatalf("otros residentes: %+v", o.Housemates)
		}
		kinds := map[string]int{}
		for _, a := range o.Activity {
			kinds[a.Kind]++
		}
		if kinds[domain.ActivityPackage] != 2 || kinds[domain.ActivityVote] != 1 {
			t.Fatalf("actividad inesperada: %+v", o.Activity)
		}
	})

	t.Run("aislamiento: Ana no existe para otra propiedad", func(t *testing.T) {
		if _, err := uc.GetResidentOverview(ctx, hp.BusinessID+100000, ana); err != domain.ErrResidentNotFound {
			t.Fatalf("esperaba ErrResidentNotFound, obtuvo %v", err)
		}
	})

	t.Run("filtros del listado", func(t *testing.T) {
		names := func(f domain.ResidentFiltersDTO) []string {
			t.Helper()
			f.BusinessID, f.Page, f.PageSize = hp.BusinessID, 1, 10
			res, err := uc.ListResidents(ctx, f)
			if err != nil {
				t.Fatalf("ListResidents: %v", err)
			}
			out := []string{}
			for _, r := range res.Residents {
				out = append(out, r.Name)
			}
			return out
		}
		if got := names(domain.ResidentFiltersDTO{Query: "126"}); len(got) != 2 {
			t.Fatalf("búsqueda por unidad 126: %v", got)
		}
		if got := names(domain.ResidentFiltersDTO{Block: "Local"}); len(got) != 1 || got[0] != "Luis Local" {
			t.Fatalf("bloque Local: %v", got)
		}
		yes := true
		if got := names(domain.ResidentFiltersDTO{WithoutEmail: &yes}); len(got) != 1 || got[0] != "Luis Local" {
			t.Fatalf("sin correo: %v", got)
		}
		res, err := uc.ListResidents(ctx, domain.ResidentFiltersDTO{BusinessID: hp.BusinessID, Query: "Ana", Page: 1, PageSize: 10})
		if err != nil || len(res.Residents) != 1 || res.Residents[0].Since == nil || !res.Residents[0].Since.Equal(moveIn) {
			t.Fatalf("'desde' de Ana debía ser su ingreso (mar 2021): %+v err=%v", res, err)
		}
		s, err := uc.GetResidentsSummary(ctx, hp.BusinessID)
		if err != nil || s.WithoutEmail != 1 {
			t.Fatalf("resumen sin correo: %+v err=%v", s, err)
		}
	})
}
