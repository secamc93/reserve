//go:build integration

package app_test

import (
	"testing"

	"central_reserve/services/horizontalproperty/resident/internal/app"
	"central_reserve/services/horizontalproperty/resident/internal/domain"
	"central_reserve/services/horizontalproperty/resident/internal/infra/secondary/repository"
	"central_reserve/shared/testkit"
	"dbpostgres/app/infra/models"
)

// El listado trae el bloque de la unidad y el documento, filtra por documento, y el resumen
// cuenta por tipo (con los tipos sin residentes en 0).
func TestResidentsSummaryAndListExtras_Integration(t *testing.T) {
	database := testkit.DB(t)
	ctx := testkit.Ctx(t)

	hp := testkit.NewHorizontalProperty(t, database, []testkit.UnitSpec{
		{Number: "126", Coefficient: 60, ResidentName: "Ana Casa"},
		{Number: "7", Coefficient: 40, ResidentName: "Luis Local"},
	})
	conn := database.Conn(ctx)
	if err := conn.Model(&models.PropertyUnit{}).Where("id = ?", hp.UnitID(0)).Update("block", "Casa").Error; err != nil {
		t.Fatal(err)
	}
	if err := conn.Model(&models.Resident{}).Where("id = ?", hp.ResidentIDByUnit[hp.UnitID(0)]).Update("dni", "IT-"+hp.Code).Error; err != nil {
		t.Fatal(err)
	}
	if err := conn.Model(&models.Resident{}).Where("id = ?", hp.ResidentIDByUnit[hp.UnitID(1)]).Update("is_active", false).Error; err != nil {
		t.Fatal(err)
	}

	logger := testkit.Logger(t)
	uc := app.New(repository.New(database, logger), logger)

	t.Run("listado con bloque y documento", func(t *testing.T) {
		res, err := uc.ListResidents(ctx, domain.ResidentFiltersDTO{BusinessID: hp.BusinessID, Page: 1, PageSize: 10})
		if err != nil {
			t.Fatalf("ListResidents: %v", err)
		}
		if res.Total != 2 {
			t.Fatalf("esperaba 2 residentes, obtuvo %d", res.Total)
		}
		var ana domain.ResidentListDTO
		for _, r := range res.Residents {
			if r.Name == "Ana Casa" {
				ana = r
			}
		}
		if ana.PropertyUnitNumber != "126" || ana.PropertyUnitBlock != "Casa" || ana.Dni != "IT-"+hp.Code {
			t.Fatalf("residente inesperado: %+v", ana)
		}
	})

	t.Run("filtro por documento", func(t *testing.T) {
		res, err := uc.ListResidents(ctx, domain.ResidentFiltersDTO{BusinessID: hp.BusinessID, Dni: "IT-" + hp.Code, Page: 1, PageSize: 10})
		if err != nil {
			t.Fatalf("ListResidents: %v", err)
		}
		if res.Total != 1 || len(res.Residents) != 1 || res.Residents[0].Name != "Ana Casa" {
			t.Fatalf("esperaba solo a Ana, obtuvo total=%d %+v", res.Total, res.Residents)
		}
	})

	t.Run("resumen por tipo", func(t *testing.T) {
		s, err := uc.GetResidentsSummary(ctx, hp.BusinessID)
		if err != nil {
			t.Fatalf("GetResidentsSummary: %v", err)
		}
		if s.Total != 2 || s.Active != 1 || s.Inactive != 1 || s.Main != 2 {
			t.Fatalf("totales inesperados: %+v", s)
		}
		var owners, others int64
		for _, ty := range s.Types {
			if ty.Code == "owner" {
				owners = ty.Total
			} else {
				others += ty.Total
			}
		}
		if owners != 2 || others != 0 || len(s.Types) < 2 {
			t.Fatalf("conteo por tipo inesperado: %+v", s.Types)
		}
	})
}
