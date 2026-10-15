//go:build integration

package app_test

import (
	"fmt"
	"testing"

	"central_reserve/services/horizontalproperty/unit/internal/app"
	"central_reserve/services/horizontalproperty/unit/internal/domain"
	"central_reserve/services/horizontalproperty/unit/internal/infra/secondary/repository"
	"central_reserve/shared/testkit"
)

// Con 205 unidades reales, la lista pagina en la BD: page_size=200 trae 200 en la página 1 y
// 5 en la 2, con total y total_pages correctos; un page_size mayor se ajusta a 200.
func TestListPropertyUnits_PaginaEnBD_Integration(t *testing.T) {
	database := testkit.DB(t)
	ctx := testkit.Ctx(t)

	const n = 205
	specs := make([]testkit.UnitSpec, n)
	for i := range specs {
		specs[i] = testkit.UnitSpec{Number: fmt.Sprintf("P-%03d", i+1), Coefficient: 100.0 / n}
	}
	hp := testkit.NewHorizontalProperty(t, database, specs)

	logger := testkit.Logger(t)
	uc := app.New(repository.New(database, logger), logger)

	list := func(page, pageSize int) *domain.PaginatedPropertyUnitsDTO {
		t.Helper()
		res, err := uc.ListPropertyUnits(ctx, domain.PropertyUnitFiltersDTO{
			BusinessID: hp.BusinessID,
			Page:       page,
			PageSize:   pageSize,
		})
		if err != nil {
			t.Fatalf("ListPropertyUnits(page=%d, page_size=%d): %v", page, pageSize, err)
		}
		return res
	}

	t.Run("page_size=200 página 1 trae 200", func(t *testing.T) {
		res := list(1, 200)
		if len(res.Units) != 200 || res.Total != n || res.Page != 1 || res.PageSize != 200 || res.TotalPages != 2 {
			t.Fatalf("esperaba 200 unidades, total=%d, total_pages=2; obtuvo %d unidades total=%d page=%d page_size=%d total_pages=%d",
				n, len(res.Units), res.Total, res.Page, res.PageSize, res.TotalPages)
		}
		if res.Units[0].Number != "P-001" || res.Units[199].Number != "P-200" {
			t.Fatalf("orden inesperado: primera=%s última=%s", res.Units[0].Number, res.Units[199].Number)
		}
	})

	t.Run("page_size=200 página 2 trae el resto (5)", func(t *testing.T) {
		res := list(2, 200)
		if len(res.Units) != 5 || res.Total != n || res.Page != 2 {
			t.Fatalf("esperaba 5 unidades en la página 2, obtuvo %d (total=%d page=%d)", len(res.Units), res.Total, res.Page)
		}
		if res.Units[0].Number != "P-201" {
			t.Fatalf("la página 2 debe empezar en P-201, empieza en %s", res.Units[0].Number)
		}
	})

	t.Run("sin page_size usa 10", func(t *testing.T) {
		res := list(0, 0)
		if len(res.Units) != 10 || res.PageSize != 10 || res.TotalPages != 21 {
			t.Fatalf("esperaba 10 unidades y 21 páginas, obtuvo %d unidades page_size=%d total_pages=%d",
				len(res.Units), res.PageSize, res.TotalPages)
		}
	})

	t.Run("page_size mayor a 200 se ajusta a 200 en el caso de uso", func(t *testing.T) {
		res := list(1, 1000)
		if len(res.Units) != 200 || res.PageSize != 200 {
			t.Fatalf("esperaba 200 unidades, obtuvo %d (page_size=%d)", len(res.Units), res.PageSize)
		}
	})
}
