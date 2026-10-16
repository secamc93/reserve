//go:build integration

package repository_test

import (
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/services/horizontalproperty/visit/internal/infra/secondary/repository"
	"central_reserve/shared/testkit"

	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

// ensureVisitCatalog asegura los estados y un tipo de visita (catálogos que siembra
// 002_visits_tables.sql; AutoMigrate no los crea). Devuelve id por código de estado.
func ensureVisitCatalog(t *testing.T, conn *gorm.DB) (map[string]uint, uint) {
	t.Helper()
	statuses := map[string]bool{"pending": false, "authorized": false, "in_progress": false, "completed": true, "cancelled": true, "expired": true, "rejected": true}
	ids := map[string]uint{}
	for code, final := range statuses {
		s := models.VisitStatus{Code: code, Name: code, IsFinal: final, IsActive: true}
		if err := conn.Where(models.VisitStatus{Code: code}).FirstOrCreate(&s).Error; err != nil {
			t.Fatalf("estado %q: %v", code, err)
		}
		ids[code] = s.ID
	}
	vt := models.VisitType{Name: "Otro", Code: "other", IsActive: true}
	if err := conn.Where(models.VisitType{Code: "other"}).FirstOrCreate(&vt).Error; err != nil {
		t.Fatalf("tipo de visita: %v", err)
	}
	return ids, vt.ID
}

// La portería ve las visitas del día por estado (dentro, esperadas, salieron, canceladas),
// busca por visitante o "Casa 126", y los conteos no mezclan negocios.
func TestListVisits_EstadosBusquedaOrdenYConteos(t *testing.T) {
	ctx := testkit.Ctx(t)
	database := testkit.DB(t)
	repo := repository.NewVisitRepository(database, testkit.Logger(t))
	conn := database.Conn(ctx)

	statusID, typeID := ensureVisitCatalog(t, conn)
	hp := testkit.NewHorizontalProperty(t, database, []testkit.UnitSpec{{Number: "126", Coefficient: 50}, {Number: "7", Coefficient: 50}})
	other := testkit.NewHorizontalProperty(t, database, []testkit.UnitSpec{{Number: "1", Coefficient: 100}})
	if err := conn.Model(&models.PropertyUnit{}).Where("id = ?", hp.UnitID(0)).Update("block", "Casa").Error; err != nil {
		t.Fatalf("bloque: %v", err)
	}

	sfx := testkit.Suffix()
	visitor := models.Visitor{BusinessID: &hp.BusinessID, DNI: "IT" + sfx, FullName: "Laura Gómez " + sfx, Phone: "3001234567"}
	if err := conn.Create(&visitor).Error; err != nil {
		t.Fatalf("visitante: %v", err)
	}

	day := time.Date(2026, 10, 15, 0, 0, 0, 0, time.UTC)
	entry := day.Add(14 * time.Hour)
	visitIDs := []uint{}
	mk := func(business, unit uint, code string, sched time.Time, hour int, entered bool) uint {
		v := models.Visit{BusinessID: business, VisitorID: visitor.ID, PropertyUnitID: unit, VisitTypeID: typeID,
			VisitStatusID: statusID[code], ScheduledDate: sched, ScheduledStartTime: sched.Add(time.Duration(hour) * time.Hour),
			AuthorizationCode: "IT-" + sfx + "-" + code + sched.Format("0102") + string(rune('a'+hour)), NumberOfVisitors: 2, Purpose: "Almuerzo"}
		if entered {
			v.ActualEntryTime = &entry
		}
		if err := conn.Create(&v).Error; err != nil {
			t.Fatalf("visita: %v", err)
		}
		visitIDs = append(visitIDs, v.ID)
		return v.ID
	}

	esperada := mk(hp.BusinessID, hp.UnitID(1), "authorized", day, 9, false)
	dentro := mk(hp.BusinessID, hp.UnitID(0), "in_progress", day, 15, true)
	salio := mk(hp.BusinessID, hp.UnitID(0), "completed", day, 8, true)
	mk(hp.BusinessID, hp.UnitID(1), "cancelled", day, 10, false)
	ayer := mk(hp.BusinessID, hp.UnitID(1), "in_progress", day.Add(-24*time.Hour), 18, true)
	mk(other.BusinessID, other.UnitID(0), "in_progress", day, 9, true)
	t.Cleanup(func() {
		conn.Unscoped().Where("id IN ?", visitIDs).Delete(&models.Visit{})
		conn.Unscoped().Delete(&models.Visitor{}, visitor.ID)
	})

	endOfDay := day.Add(24*time.Hour - time.Nanosecond)
	today, err := repo.ListVisits(ctx, domain.VisitFiltersDTO{BusinessID: hp.BusinessID, StartDate: &day, EndDate: &endOfDay, Page: 1, PageSize: 50})
	if err != nil {
		t.Fatalf("ListVisits: %v", err)
	}
	if today.Total != 4 {
		t.Fatalf("visitas del día = %d, se esperaban 4 (sin la de ayer ni la del otro negocio)", today.Total)
	}
	if today.Visits[0].ID != dentro || today.Visits[1].ID != esperada || today.Visits[2].ID != salio {
		t.Fatalf("orden del día: %d, %d, %d; se esperaba dentro (%d), esperada (%d), salió (%d)",
			today.Visits[0].ID, today.Visits[1].ID, today.Visits[2].ID, dentro, esperada, salio)
	}
	first := today.Visits[0]
	if first.PropertyUnitBlock != "Casa" || first.PropertyUnitNumber != "126" || first.VisitStatusCode != "in_progress" ||
		first.VisitorPhone != "3001234567" || first.Purpose != "Almuerzo" || first.NumberOfVisitors != 2 {
		t.Errorf("fila incompleta: %+v", first)
	}

	inside, err := repo.ListVisits(ctx, domain.VisitFiltersDTO{BusinessID: hp.BusinessID, State: domain.VisitStateInside, Page: 1, PageSize: 50})
	if err != nil || inside.Total != 2 {
		t.Fatalf("dentro (cualquier día): %v err=%v, se esperaban 2", inside.Total, err)
	}
	expected, err := repo.ListVisits(ctx, domain.VisitFiltersDTO{BusinessID: hp.BusinessID, State: domain.VisitStateExpected, Page: 1, PageSize: 50})
	if err != nil || expected.Total != 1 || expected.Visits[0].ID != esperada {
		t.Fatalf("esperadas: %+v err=%v", expected, err)
	}

	casa, err := repo.ListVisits(ctx, domain.VisitFiltersDTO{BusinessID: hp.BusinessID, Search: "casa 126", Page: 1, PageSize: 50})
	if err != nil || casa.Total != 2 {
		t.Fatalf("búsqueda 'casa 126': %v err=%v, se esperaban 2", casa.Total, err)
	}
	byName, err := repo.ListVisits(ctx, domain.VisitFiltersDTO{BusinessID: hp.BusinessID, Search: "laura gómez", Page: 1, PageSize: 50})
	if err != nil || byName.Total != 5 {
		t.Fatalf("búsqueda por nombre: %v err=%v, se esperaban 5", byName.Total, err)
	}

	to := day.Add(24 * time.Hour)
	n, err := repo.CountVisitsByStatusCodes(ctx, hp.BusinessID, domain.VisitStateGroups[domain.VisitStateInside], &day, &to)
	if err != nil || n != 1 {
		t.Fatalf("dentro hoy: %d err=%v, se esperaba 1", n, err)
	}
	n, err = repo.CountVisitsByStatusCodes(ctx, hp.BusinessID, domain.VisitStateGroups[domain.VisitStateInside], nil, nil)
	if err != nil || n != 2 {
		t.Fatalf("dentro ahora: %d err=%v, se esperaban 2 (incluye la de ayer: %d)", n, err, ayer)
	}
}

// Regresión: cancelar una visita no cambiaba su estado.
func TestChangeVisitStatus_CancelaPorCodigo(t *testing.T) {
	ctx := testkit.Ctx(t)
	database := testkit.DB(t)
	repo := repository.NewVisitRepository(database, testkit.Logger(t))
	conn := database.Conn(ctx)

	statusID, typeID := ensureVisitCatalog(t, conn)
	hp := testkit.NewHorizontalProperty(t, database, []testkit.UnitSpec{{Number: "126", Coefficient: 100}})
	sfx := testkit.Suffix()
	visitor := models.Visitor{BusinessID: &hp.BusinessID, DNI: "IT" + sfx, FullName: "IT " + sfx}
	if err := conn.Create(&visitor).Error; err != nil {
		t.Fatalf("visitante: %v", err)
	}
	now := time.Now()
	v := models.Visit{BusinessID: hp.BusinessID, VisitorID: visitor.ID, PropertyUnitID: hp.UnitID(0), VisitTypeID: typeID,
		VisitStatusID: statusID["pending"], ScheduledDate: now, ScheduledStartTime: now, AuthorizationCode: "IT-C-" + sfx}
	if err := conn.Create(&v).Error; err != nil {
		t.Fatalf("visita: %v", err)
	}
	t.Cleanup(func() {
		conn.Unscoped().Delete(&models.Visit{}, v.ID)
		conn.Unscoped().Delete(&models.Visitor{}, visitor.ID)
	})

	if err := repo.ChangeVisitStatus(ctx, v.ID, "cancelled"); err != nil {
		t.Fatal(err)
	}
	_, _, status, err := repo.GetVisitWithRelations(ctx, v.ID)
	if err != nil || status.Code != "cancelled" {
		t.Fatalf("estado = %+v err=%v, se esperaba cancelled", status, err)
	}
}
