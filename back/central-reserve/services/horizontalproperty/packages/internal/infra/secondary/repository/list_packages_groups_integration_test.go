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

// La portería ve primero lo que está por entregar, del más antiguo al más reciente; puede
// filtrar por grupo de estados y buscar por guía o "Casa 126". Los conteos no mezclan negocios.
func TestListPackages_PorEntregarPrimeroGruposBusquedaYConteos(t *testing.T) {
	ctx := testkit.Ctx(t)
	database := testkit.DB(t)
	repo := repository.NewPackageRepository(database, testkit.Logger(t))
	conn := database.Conn(ctx)

	hp := testkit.NewHorizontalProperty(t, database, []testkit.UnitSpec{{Number: "126", Coefficient: 50}, {Number: "7", Coefficient: 50}})
	other := testkit.NewHorizontalProperty(t, database, []testkit.UnitSpec{{Number: "126", Coefficient: 100}})
	if err := conn.Model(&models.PropertyUnit{}).Where("id = ?", hp.UnitID(0)).Update("block", "Casa").Error; err != nil {
		t.Fatalf("bloque: %v", err)
	}

	statusID := func(code string) uint {
		var s models.PackageStatus
		if err := conn.Where("code = ?", code).First(&s).Error; err != nil {
			t.Fatalf("estado %q (lo siembra la migración): %v", code, err)
		}
		return s.ID
	}

	now := time.Now()
	at := func(h int) *time.Time { v := now.Add(time.Duration(-h) * time.Hour); return &v }
	ids := []uint{}
	mk := func(business, unit uint, code, tracking string, received *time.Time, delivered *time.Time) uint {
		p := models.Package{BusinessID: business, PropertyUnitID: unit, PackageStatusID: statusID(code),
			Carrier: "Servientrega", TrackingNumber: tracking, ReceivedAt: received, DeliveredAt: delivered}
		if err := conn.Create(&p).Error; err != nil {
			t.Fatalf("crear paquete: %v", err)
		}
		ids = append(ids, p.ID)
		return p.ID
	}

	entregado := mk(hp.BusinessID, hp.UnitID(1), "delivered", hp.Code+"-D", at(5), at(1))
	reciente := mk(hp.BusinessID, hp.UnitID(1), "received", hp.Code+"-R", at(2), nil)
	viejo := mk(hp.BusinessID, hp.UnitID(0), "in_storage", hp.Code+"-V", at(100), nil)
	devuelto := mk(hp.BusinessID, hp.UnitID(0), "returned", hp.Code+"-X", at(200), nil)
	mk(other.BusinessID, other.UnitID(0), "received", other.Code+"-O", at(150), nil)
	t.Cleanup(func() { conn.Unscoped().Where("id IN ?", ids).Delete(&models.Package{}) })

	all, err := repo.ListPackages(ctx, domain.PackageFiltersDTO{BusinessID: hp.BusinessID, Page: 1, PageSize: 50})
	if err != nil {
		t.Fatalf("ListPackages: %v", err)
	}
	got := []uint{}
	for _, p := range all.Packages {
		got = append(got, p.ID)
	}
	want := []uint{viejo, reciente}
	if len(got) != 4 || got[0] != want[0] || got[1] != want[1] {
		t.Fatalf("orden = %v; se esperaban primero los por entregar del más antiguo al más reciente %v", got, want)
	}
	if all.Packages[0].PropertyUnitBlock != "Casa" || all.Packages[0].PropertyUnitNumber != "126" {
		t.Errorf("unidad = %q %q, se esperaba Casa 126", all.Packages[0].PropertyUnitBlock, all.Packages[0].PropertyUnitNumber)
	}

	pend, err := repo.ListPackages(ctx, domain.PackageFiltersDTO{BusinessID: hp.BusinessID, StatusGroup: domain.PackageGroupPending, Page: 1, PageSize: 50})
	if err != nil || pend.Total != 2 {
		t.Fatalf("grupo pending: total=%v err=%v, se esperaban 2", pend.Total, err)
	}
	del, err := repo.ListPackages(ctx, domain.PackageFiltersDTO{BusinessID: hp.BusinessID, StatusGroup: domain.PackageGroupDelivered, Page: 1, PageSize: 50})
	if err != nil || del.Total != 1 || del.Packages[0].ID != entregado {
		t.Fatalf("grupo delivered: %+v err=%v", del, err)
	}
	closed, err := repo.ListPackages(ctx, domain.PackageFiltersDTO{BusinessID: hp.BusinessID, StatusGroup: domain.PackageGroupClosed, Page: 1, PageSize: 50})
	if err != nil || closed.Total != 1 || closed.Packages[0].ID != devuelto {
		t.Fatalf("grupo closed: %+v err=%v", closed, err)
	}

	casa, err := repo.ListPackages(ctx, domain.PackageFiltersDTO{BusinessID: hp.BusinessID, Search: "casa 126", Page: 1, PageSize: 50})
	if err != nil || casa.Total != 2 {
		t.Fatalf("búsqueda 'casa 126': total=%v err=%v, se esperaban 2", casa.Total, err)
	}
	guia, err := repo.ListPackages(ctx, domain.PackageFiltersDTO{BusinessID: hp.BusinessID, Search: hp.Code + "-r", Page: 1, PageSize: 50})
	if err != nil || guia.Total != 1 || guia.Packages[0].ID != reciente {
		t.Fatalf("búsqueda por guía: %+v err=%v", guia, err)
	}

	codes := domain.PackageStatusGroups[domain.PackageGroupPending]
	n, err := repo.CountPackagesByStatusCodes(ctx, hp.BusinessID, codes, nil, nil)
	if err != nil || n != 2 {
		t.Fatalf("por entregar: %d err=%v, se esperaban 2 (sin contar el otro negocio)", n, err)
	}
	limit := now.Add(-domain.PackageOverdueAfter)
	n, err = repo.CountPackagesByStatusCodes(ctx, hp.BusinessID, codes, &limit, nil)
	if err != nil || n != 1 {
		t.Fatalf("atrasados: %d err=%v, se esperaba 1", n, err)
	}
	since := now.Add(-3 * time.Hour)
	n, err = repo.CountPackagesByStatusCodes(ctx, hp.BusinessID, domain.PackageStatusGroups[domain.PackageGroupDelivered], nil, &since)
	if err != nil || n != 1 {
		t.Fatalf("entregados desde hace 3 h: %d err=%v, se esperaba 1", n, err)
	}
}
