//go:build integration

package repository_test

import (
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/packages/internal/domain"
	"central_reserve/services/horizontalproperty/packages/internal/infra/secondary/repository"
	"central_reserve/shared/testkit"

	"dbpostgres/app/infra/models"
)

// Regresión: ListPackages respondía 500 con cualquier filtro ("missing FROM-clause entry for
// table \"p\""): el ORDER BY y los filtros de fecha usaban el alias "p" que la consulta no define.
// La tabla de paquetería del front nunca cargaba datos.
func TestListPackages_PaginaYFiltraPorFecha(t *testing.T) {
	ctx := testkit.Ctx(t)
	database := testkit.DB(t)
	repo := repository.NewPackageRepository(database, testkit.Logger(t))
	conn := database.Conn(ctx)

	hp := testkit.NewHorizontalProperty(t, database, []testkit.UnitSpec{{Number: "101", Coefficient: 100}})

	var status models.PackageStatus
	if err := conn.Where("code = ?", "received").First(&status).Error; err != nil {
		t.Fatalf("estado 'received' (lo siembra la migración): %v", err)
	}

	base := time.Now().Add(-48 * time.Hour)
	ids := []uint{}
	for i := 0; i < 15; i++ {
		received := base.Add(time.Duration(i) * time.Hour)
		p := models.Package{BusinessID: hp.BusinessID, PropertyUnitID: hp.UnitID(0), PackageStatusID: status.ID,
			Carrier: "IT", TrackingNumber: hp.Code + "-" + string(rune('A'+i)), ReceivedAt: &received}
		if err := conn.Create(&p).Error; err != nil {
			t.Fatalf("crear paquete: %v", err)
		}
		ids = append(ids, p.ID)
	}
	// Se registra después de NewHorizontalProperty: corre antes que su limpieza (orden LIFO).
	t.Cleanup(func() { conn.Unscoped().Where("id IN ?", ids).Delete(&models.Package{}) })

	page1, err := repo.ListPackages(ctx, domain.PackageFiltersDTO{BusinessID: hp.BusinessID, Page: 1, PageSize: 10})
	if err != nil {
		t.Fatalf("ListPackages página 1: %v", err)
	}
	if page1.Total != 15 || len(page1.Packages) != 10 {
		t.Fatalf("página 1: total=%d filas=%d, se esperaba 15 y 10", page1.Total, len(page1.Packages))
	}
	page2, err := repo.ListPackages(ctx, domain.PackageFiltersDTO{BusinessID: hp.BusinessID, Page: 2, PageSize: 10})
	if err != nil || len(page2.Packages) != 5 {
		t.Fatalf("página 2: filas=%v err=%v, se esperaban 5", len(page2.Packages), err)
	}

	desde := time.Now().Add(-time.Minute)
	filtrado, err := repo.ListPackages(ctx, domain.PackageFiltersDTO{BusinessID: hp.BusinessID, StartDate: &desde, Page: 1, PageSize: 200})
	if err != nil {
		t.Fatalf("ListPackages con filtro de fecha: %v", err)
	}
	if filtrado.Total != 15 || len(filtrado.Packages) != 15 {
		t.Fatalf("filtro de fecha (creados hace menos de 1 min): total=%d filas=%d, se esperaba 15", filtrado.Total, len(filtrado.Packages))
	}
}
