//go:build integration

package app_test

import (
	"math"
	"testing"

	"central_reserve/services/horizontalproperty/unit/internal/app"
	"central_reserve/services/horizontalproperty/unit/internal/domain"
	"central_reserve/services/horizontalproperty/unit/internal/infra/secondary/repository"
	"central_reserve/shared/testkit"
	"dbpostgres/app/infra/models"
)

// El resumen agrupa por bloque con la suma de coeficientes, la lista trae la ocupación
// (residentes y residente principal) y desactivar una unidad sí se guarda.
func TestPropertyUnitsSummaryOccupancyAndDeactivate_Integration(t *testing.T) {
	database := testkit.DB(t)
	ctx := testkit.Ctx(t)

	hp := testkit.NewHorizontalProperty(t, database, []testkit.UnitSpec{
		{Number: "1", Coefficient: 40, ResidentName: "Ana Casa"},
		{Number: "2", Coefficient: 35},
		{Number: "3", Coefficient: 25, ResidentName: "Luis Local"},
	})
	conn := database.Conn(ctx)
	setBlock := func(i int, block string) {
		if err := conn.Model(&models.PropertyUnit{}).Where("id = ?", hp.UnitID(i)).Update("block", block).Error; err != nil {
			t.Fatalf("asignando bloque: %v", err)
		}
	}
	setBlock(0, "Casa")
	setBlock(1, "Casa")
	setBlock(2, "Local")

	logger := testkit.Logger(t)
	uc := app.New(repository.New(database, logger), logger)

	t.Run("resumen por bloque", func(t *testing.T) {
		s, err := uc.GetPropertyUnitsSummary(ctx, hp.BusinessID)
		if err != nil {
			t.Fatalf("GetPropertyUnitsSummary: %v", err)
		}
		if s.Total != 3 || s.Active != 3 || s.WithResidents != 2 || math.Abs(s.CoefficientSum-100) > 1e-6 {
			t.Fatalf("totales inesperados: %+v", s)
		}
		if len(s.Blocks) != 2 || s.Blocks[0].Block != "Casa" || s.Blocks[0].Total != 2 || math.Abs(s.Blocks[0].CoefficientSum-75) > 1e-6 ||
			s.Blocks[1].Block != "Local" || s.Blocks[1].Total != 1 {
			t.Fatalf("bloques inesperados: %+v", s.Blocks)
		}
	})

	t.Run("la lista trae la ocupación", func(t *testing.T) {
		res, err := uc.ListPropertyUnits(ctx, domain.PropertyUnitFiltersDTO{BusinessID: hp.BusinessID, Page: 1, PageSize: 10})
		if err != nil {
			t.Fatalf("ListPropertyUnits: %v", err)
		}
		byNumber := map[string]domain.PropertyUnitListDTO{}
		for _, u := range res.Units {
			byNumber[u.Number] = u
		}
		if byNumber["1"].ResidentsCount != 1 || byNumber["1"].MainResidentName != "Ana Casa" {
			t.Fatalf("unidad 1: %+v", byNumber["1"])
		}
		if byNumber["2"].ResidentsCount != 0 || byNumber["2"].MainResidentName != "" {
			t.Fatalf("unidad 2 no tiene residentes: %+v", byNumber["2"])
		}
	})

	t.Run("desactivar una unidad se guarda (is_active=false)", func(t *testing.T) {
		inactive := false
		if _, err := uc.UpdatePropertyUnit(ctx, hp.UnitID(1), domain.UpdatePropertyUnitDTO{IsActive: &inactive}); err != nil {
			t.Fatalf("UpdatePropertyUnit: %v", err)
		}
		got, err := uc.GetPropertyUnitByID(ctx, hp.UnitID(1))
		if err != nil {
			t.Fatalf("GetPropertyUnitByID: %v", err)
		}
		if got.IsActive {
			t.Fatal("la unidad debía quedar inactiva")
		}
		if got.Block != "Casa" || got.Number != "2" {
			t.Fatalf("el resto de campos no debía cambiar: %+v", got)
		}
	})

	t.Run("búsqueda por número o residente, sin residente y agrupado por bloque", func(t *testing.T) {
		list := func(f domain.PropertyUnitFiltersDTO) []string {
			t.Helper()
			f.BusinessID, f.Page, f.PageSize = hp.BusinessID, 1, 10
			res, err := uc.ListPropertyUnits(ctx, f)
			if err != nil {
				t.Fatalf("ListPropertyUnits: %v", err)
			}
			out := []string{}
			for _, u := range res.Units {
				out = append(out, u.Block+" "+u.Number)
			}
			return out
		}
		if got := list(domain.PropertyUnitFiltersDTO{Query: "luis"}); len(got) != 1 || got[0] != "Local 3" {
			t.Fatalf("buscar por residente 'luis': %v", got)
		}
		if got := list(domain.PropertyUnitFiltersDTO{Query: "2"}); len(got) != 1 || got[0] != "Casa 2" {
			t.Fatalf("buscar por número '2': %v", got)
		}
		yes := true
		if got := list(domain.PropertyUnitFiltersDTO{WithoutResidents: &yes}); len(got) != 1 || got[0] != "Casa 2" {
			t.Fatalf("sin residente: %v", got)
		}
		if got := list(domain.PropertyUnitFiltersDTO{GroupByBlock: true}); len(got) != 3 || got[0] != "Casa 1" || got[2] != "Local 3" {
			t.Fatalf("agrupado por bloque: %v", got)
		}
	})
}
