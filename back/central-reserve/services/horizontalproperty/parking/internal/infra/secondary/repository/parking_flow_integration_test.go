//go:build integration

package repository_test

import (
	"errors"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/parking/internal/app"
	"central_reserve/services/horizontalproperty/parking/internal/domain"
	"central_reserve/services/horizontalproperty/parking/internal/infra/secondary/repository"
	"central_reserve/shared/testkit"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

// Flujo completo de parqueaderos contra la BD local: cupos en lote, asignar, filtros por vigencia,
// liberar dos veces el mismo cupo (índice parcial), reservar un cupo de visitante (estado por
// código y columnas `time`), listar por día y check-in / check-out.
func TestParkingFlow(t *testing.T) {
	ctx := testkit.Ctx(t)
	database := testkit.DB(t)
	logger := testkit.Logger(t)
	uc := app.New(
		repository.NewParkingZoneRepository(database, logger),
		repository.NewParkingSlotRepository(database, logger),
		repository.NewParkingAssignmentRepository(database, logger),
		repository.NewParkingReservationRepository(database, logger),
		repository.NewParkingOccupancyRepository(database, logger),
		repository.NewParkingTypeRepository(database, logger),
		logger,
	)
	hp := testkit.NewHorizontalProperty(t, database, []testkit.UnitSpec{{Number: "126", Coefficient: 50}, {Number: "127", Coefficient: 50}})
	// Se registra después del fixture, así corre antes que su limpieza (LIFO): borra lo de
	// parqueaderos que cuelga de las unidades y del negocio.
	t.Cleanup(func() {
		conn := func() *gorm.DB { return database.Conn(ctx).Unscoped() }
		var zoneIDs []uint
		conn().Model(&models.ParkingZone{}).Where("business_id = ?", hp.BusinessID).Pluck("id", &zoneIDs)
		steps := []func() error{
			func() error {
				if len(zoneIDs) == 0 {
					return nil
				}
				return conn().Where("parking_slot_id IN (?)", conn().Model(&models.ParkingSlot{}).Select("id").Where("parking_zone_id IN ?", zoneIDs)).Delete(&models.ParkingOccupancy{}).Error
			},
			func() error { return conn().Where("business_id = ?", hp.BusinessID).Delete(&models.ParkingReservation{}).Error },
			func() error { return conn().Where("business_id = ?", hp.BusinessID).Delete(&models.ParkingAssignment{}).Error },
			func() error {
				if len(zoneIDs) == 0 {
					return nil
				}
				return conn().Where("parking_zone_id IN ?", zoneIDs).Delete(&models.ParkingSlot{}).Error
			},
			func() error { return conn().Where("business_id = ?", hp.BusinessID).Delete(&models.ParkingZone{}).Error },
		}
		for _, step := range steps {
			if err := step(); err != nil {
				t.Errorf("limpieza de parqueaderos: %v", err)
			}
		}
	})

	var carType models.ParkingType
	if err := database.Conn(ctx).Where("code = ?", "car").First(&carType).Error; err != nil {
		t.Fatalf("falta el tipo de parqueadero 'car' (corra las migraciones): %v", err)
	}
	zone, err := uc.CreateParkingZone(ctx, domain.CreateParkingZoneDTO{BusinessID: hp.BusinessID, Name: "Sótano " + hp.Code, Code: "S" + testkit.Suffix()})
	if err != nil {
		t.Fatalf("CreateParkingZone: %v", err)
	}

	// Cupos en lote: todos o ninguno.
	slots, err := uc.CreateParkingSlotsBulk(ctx, domain.CreateParkingSlotsBulkDTO{BusinessID: hp.BusinessID, ParkingZoneID: zone.ID, ParkingTypeID: carType.ID, Prefix: "P-", From: 1, To: 3, Pad: 3})
	if err != nil || len(slots) != 3 || slots[0].SlotNumber != "P-001" || slots[0].ID == 0 {
		t.Fatalf("CreateParkingSlotsBulk: %v %+v", err, slots)
	}
	if _, err := uc.CreateParkingSlotsBulk(ctx, domain.CreateParkingSlotsBulkDTO{BusinessID: hp.BusinessID, ParkingZoneID: zone.ID, ParkingTypeID: carType.ID, Prefix: "P-", From: 3, To: 4, Pad: 3}); !errors.Is(err, domain.ErrSlotNumberExists) {
		t.Fatalf("número repetido: esperaba ErrSlotNumberExists, obtuve %v", err)
	}

	// Asignar y filtrar por vigencia.
	today := time.Date(2026, 10, 15, 0, 0, 0, 0, time.UTC)
	unit := hp.UnitID(0)
	end := today.AddDate(0, 0, 10)
	a, err := uc.AssignParking(ctx, domain.AssignParkingDTO{BusinessID: hp.BusinessID, ParkingSlotID: slots[0].ID, PropertyUnitID: &unit, VehiclePlate: "KLM-220", StartDate: today.AddDate(0, -1, 0), EndDate: &end, AssignedByUserID: 1})
	if err != nil {
		t.Fatalf("AssignParking: %v", err)
	}
	sum, err := uc.GetParkingAssignmentSummary(ctx, hp.BusinessID, today)
	if err != nil || sum.Active != 1 || sum.Expiring30 != 1 || sum.Expired != 0 || sum.UnitsWithoutSlot != 1 {
		t.Fatalf("resumen: %+v (%v)", sum, err)
	}
	for status, want := range map[string]int64{domain.AssignmentStatusActive: 1, domain.AssignmentStatusExpiring: 1, domain.AssignmentStatusExpired: 0} {
		page, err := uc.ListParkingAssignments(ctx, domain.ParkingAssignmentFiltersDTO{BusinessID: hp.BusinessID, Status: status, Today: today, Page: 1, PageSize: 10})
		if err != nil || page.Total != want {
			t.Fatalf("status=%s: total %d, se esperaba %d (%v)", status, page.Total, want, err)
		}
	}
	page, err := uc.ListParkingAssignments(ctx, domain.ParkingAssignmentFiltersDTO{BusinessID: hp.BusinessID, Search: "klm", Today: today, Page: 1, PageSize: 10})
	if err != nil || page.Total != 1 || page.ParkingAssignments[0].PropertyUnitNumber != "126" || page.ParkingAssignments[0].ParkingZoneName != zone.Name {
		t.Fatalf("búsqueda por placa: %+v (%v)", page, err)
	}
	if _, err := uc.GetParkingAssignmentSummary(ctx, hp.BusinessID, today.AddDate(0, 0, 20)); err != nil {
		t.Fatalf("resumen futuro: %v", err)
	}

	// Liberar, reasignar y liberar de nuevo el mismo cupo: antes el índice único
	// (parking_slot_id, is_active) impedía la segunda liberación.
	if _, err := uc.ReleaseParkingAssignment(ctx, hp.BusinessID, a.ID, today); err != nil {
		t.Fatalf("primera liberación: %v", err)
	}
	a2, err := uc.AssignParking(ctx, domain.AssignParkingDTO{BusinessID: hp.BusinessID, ParkingSlotID: slots[0].ID, PropertyUnitID: &unit, VehiclePlate: "XYZ-123", StartDate: today, AssignedByUserID: 1})
	if err != nil {
		t.Fatalf("reasignar: %v", err)
	}
	if _, err := uc.ReleaseParkingAssignment(ctx, hp.BusinessID, a2.ID, today); err != nil {
		t.Fatalf("segunda liberación del mismo cupo: %v", err)
	}
	if _, err := uc.ReleaseParkingAssignment(ctx, hp.BusinessID+999999, a2.ID, today); !errors.Is(err, domain.ErrParkingAssignmentNotFound) {
		t.Fatalf("liberar desde otra propiedad: %v", err)
	}

	// Reserva de visitante: estado "confirmed" por código y horas en columnas `time`.
	r, err := uc.CreateParkingReservation(ctx, domain.CreateParkingReservationDTO{BusinessID: hp.BusinessID, ParkingSlotID: slots[1].ID, ReservationDate: today, StartTime: "09:00", EndTime: "11:00", VehiclePlate: "KJM-842"})
	if err != nil {
		t.Fatalf("CreateParkingReservation: %v", err)
	}
	if _, err := uc.CreateParkingReservation(ctx, domain.CreateParkingReservationDTO{BusinessID: hp.BusinessID, ParkingSlotID: slots[1].ID, ReservationDate: today, StartTime: "10:00", EndTime: "10:30", VehiclePlate: "AAA-111"}); !errors.Is(err, domain.ErrParkingSlotNotAvailable) {
		t.Fatalf("reserva traslapada: esperaba ErrParkingSlotNotAvailable, obtuve %v", err)
	}
	list, err := uc.ListParkingReservations(ctx, domain.ParkingReservationFiltersDTO{BusinessID: hp.BusinessID, StartDate: &today, EndDate: &today, Page: 1, PageSize: 10})
	if err != nil || list.Total != 1 || list.ParkingReservations[0].StatusName != "Confirmada" || list.ParkingReservations[0].StartTime[:5] != "09:00" {
		t.Fatalf("lista por día: %+v (%v)", list, err)
	}
	if _, err := uc.CheckInParking(ctx, r.ID, 1); err != nil {
		t.Fatalf("check-in: %v", err)
	}
	if _, err := uc.CheckOutParking(ctx, r.ID, 1); err != nil {
		t.Fatalf("check-out: %v", err)
	}
}
