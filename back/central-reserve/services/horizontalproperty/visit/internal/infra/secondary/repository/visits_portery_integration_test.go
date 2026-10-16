//go:build integration

package repository_test

import (
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/services/horizontalproperty/visit/internal/infra/secondary/repository"
	"central_reserve/shared/testkit"

	"dbpostgres/app/infra/models"
)

// Diseño V1/V3: la que excede su tiempo sale primero entre las de "dentro", con placa,
// código de autorización y quién autorizó; las tarjetas del día traen excedidas, próxima
// esperada y estadía promedio; el vehículo se registra una vez por placa.
func TestVisitas_ExcedeTiempoPlacaTarjetasYVehiculo(t *testing.T) {
	ctx := testkit.Ctx(t)
	database := testkit.DB(t)
	repo := repository.NewVisitRepository(database, testkit.Logger(t))
	visitors := repository.NewVisitorRepository(database, testkit.Logger(t))
	conn := database.Conn(ctx)

	statusID, typeID := ensureVisitCatalog(t, conn)
	sfx := testkit.Suffix()
	minutes := 20
	short := models.VisitType{Name: "IT corta " + sfx, Code: "it" + sfx, DefaultDurationMinutes: &minutes, IsActive: true}
	if err := conn.Create(&short).Error; err != nil {
		t.Fatalf("tipo corto: %v", err)
	}
	hp := testkit.NewHorizontalProperty(t, database, []testkit.UnitSpec{{Number: "126", Coefficient: 100, ResidentName: "María López " + sfx}})
	if err := conn.Model(&models.PropertyUnit{}).Where("id = ?", hp.UnitID(0)).Update("block", "Casa").Error; err != nil {
		t.Fatal(err)
	}
	residentID := hp.ResidentIDByUnit[hp.UnitID(0)]

	visitor := models.Visitor{BusinessID: &hp.BusinessID, DNI: "IT" + sfx, FullName: "Jorge Ramírez " + sfx}
	if err := conn.Create(&visitor).Error; err != nil {
		t.Fatal(err)
	}
	vid := visitor.ID
	vehicle, err := visitors.UpsertVehicle(ctx, &domain.VisitorVehicle{BusinessID: hp.BusinessID, VisitorID: &vid, Plate: "KJM" + sfx[len(sfx)-3:], Brand: "Mazda"})
	if err != nil {
		t.Fatalf("UpsertVehicle: %v", err)
	}
	again, err := visitors.UpsertVehicle(ctx, &domain.VisitorVehicle{BusinessID: hp.BusinessID, Plate: vehicle.Plate, Color: "Gris"})
	if err != nil || again.ID != vehicle.ID || again.Color != "Gris" || again.Brand != "Mazda" {
		t.Fatalf("la misma placa debía reutilizar el vehículo: %+v err=%v", again, err)
	}

	now := time.Now()
	day := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
	ids := []uint{}
	mk := func(code string, vtype uint, entry, exit *time.Time, hour int, withCar bool) uint {
		v := models.Visit{BusinessID: hp.BusinessID, VisitorID: visitor.ID, PropertyUnitID: hp.UnitID(0), VisitTypeID: vtype,
			VisitStatusID: statusID[code], ScheduledDate: day, ScheduledStartTime: day.Add(time.Duration(hour) * time.Hour),
			ActualEntryTime: entry, ActualExitTime: exit, AuthorizationCode: "IT-" + sfx + "-" + code + string(rune('a'+hour)),
			ResidentID: &residentID, AuthorizedByResidentID: &residentID}
		if withCar {
			v.VisitorVehicleID = &vehicle.ID
		}
		if err := conn.Create(&v).Error; err != nil {
			t.Fatalf("visita: %v", err)
		}
		ids = append(ids, v.ID)
		return v.ID
	}
	recent := now.Add(-5 * time.Minute)
	old := now.Add(-2 * time.Hour)
	enTiempo := mk("in_progress", typeID, &recent, nil, 9, false)
	excede := mk("in_progress", short.ID, &old, nil, 10, true)
	mk("authorized", typeID, nil, nil, 11, false)
	mk("authorized", typeID, nil, nil, 15, false)
	in1, out1 := now.Add(-3*time.Hour), now.Add(-2*time.Hour)                // 60 min
	in2, out2 := now.Add(-3*time.Hour), now.Add(-3*time.Hour+80*time.Minute) // 80 min
	mk("completed", typeID, &in1, &out1, 7, false)
	mk("completed", typeID, &in2, &out2, 8, false)
	t.Cleanup(func() {
		conn.Unscoped().Where("id IN ?", ids).Delete(&models.Visit{})
		conn.Unscoped().Delete(&models.VisitorVehicle{}, vehicle.ID)
		conn.Unscoped().Delete(&models.Visitor{}, visitor.ID)
		conn.Unscoped().Delete(&models.VisitType{}, short.ID)
	})

	inside, err := repo.ListVisits(ctx, domain.VisitFiltersDTO{BusinessID: hp.BusinessID, State: domain.VisitStateInside, Page: 1, PageSize: 10})
	if err != nil || len(inside.Visits) != 2 {
		t.Fatalf("dentro: %+v err=%v", inside, err)
	}
	first := inside.Visits[0]
	if first.ID != excede || !first.ExceedsTime || inside.Visits[1].ID != enTiempo || inside.Visits[1].ExceedsTime {
		t.Fatalf("la que excede debía ir primero: %+v", inside.Visits)
	}
	if first.VisitorVehiclePlate != vehicle.Plate || first.AuthorizationCode == "" || first.AuthorizedByName == "" || first.ResidentName == "" {
		t.Errorf("faltan datos de la fila: %+v", first)
	}
	if first.PropertyUnitID != hp.UnitID(0) || first.VisitorID != visitor.ID {
		t.Errorf("ids de unidad/visitante: %d %d", first.PropertyUnitID, first.VisitorID)
	}
	if first.StayLimitMinutes == nil || *first.StayLimitMinutes != 20 {
		t.Errorf("límite = %v, se esperaban 20 min", first.StayLimitMinutes)
	}

	byPlate, err := repo.ListVisits(ctx, domain.VisitFiltersDTO{BusinessID: hp.BusinessID, Search: vehicle.Plate, Page: 1, PageSize: 10})
	if err != nil || byPlate.Total != 1 || byPlate.Visits[0].ID != excede {
		t.Fatalf("búsqueda por placa: %+v err=%v", byPlate, err)
	}
	byCode, err := repo.ListVisits(ctx, domain.VisitFiltersDTO{BusinessID: hp.BusinessID, Search: first.AuthorizationCode, Page: 1, PageSize: 10})
	if err != nil || byCode.Total != 1 {
		t.Fatalf("búsqueda por código de autorización: %v err=%v", byCode.Total, err)
	}

	extras, err := repo.GetVisitsDayExtras(ctx, hp.BusinessID, day, day.Add(24*time.Hour))
	if err != nil {
		t.Fatal(err)
	}
	if extras.Exceeded != 1 {
		t.Errorf("excedidas = %d, se esperaba 1", extras.Exceeded)
	}
	if extras.NextExpectedAt == nil || extras.NextExpectedAt.UTC().Hour() != 11 || extras.NextUnitBlock != "Casa" || extras.NextUnitNumber != "126" {
		t.Errorf("próxima = %v %q %q, se esperaba 11:00 Casa 126", extras.NextExpectedAt, extras.NextUnitBlock, extras.NextUnitNumber)
	}
	if extras.AvgStayMinutes == nil || *extras.AvgStayMinutes != 70 {
		t.Errorf("promedio = %v, se esperaban 70 min", extras.AvgStayMinutes)
	}
}
